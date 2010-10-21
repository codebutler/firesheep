// Based on http://www.tcpdump.org/pcap.htm
// http://www.tcpdump.org/sniffex.c

#include <boost/format.hpp>
#include <pcap.h>
#include "http_sniffer.hpp"
#include "http_packet.hpp"
#include "tcpip.h"

HttpSniffer::HttpSniffer (string iface, string filter, http_packet_cb callback)
	: m_iface(iface), m_filter(filter), m_callback(callback) { }

void HttpSniffer::start()
{
	char errbuf[PCAP_ERRBUF_SIZE];		/* error buffer */
	pcap_t *handle;										/* packet capture handle */

	struct bpf_program fp;			/* compiled filter program (expression) */
	bpf_u_int32 mask = 0;				/* subnet mask */
	bpf_u_int32 net  = 0;				/* ip */

	/* get network number and mask associated with capture device */
	if (pcap_lookupnet(m_iface.c_str(), &net, &mask, errbuf) == -1)
		throw runtime_error(str(boost::format("Coudn't get netmask for device %s: %s") % m_iface % errbuf));

	/* open capture device */
	handle = pcap_open_live(m_iface.c_str(), SNAP_LEN, 1, 1000, errbuf);
	if (handle == NULL)
		throw runtime_error(str(boost::format("Couldn't open device %s: %s") % m_iface % errbuf));
	
	/* make sure we're capturing on an Ethernet device [2] */
	if (pcap_datalink(handle) != DLT_EN10MB)
		throw runtime_error(str(boost::format("%s is not an Ethernet device") % m_iface));

	/* compile the filter expression */
	if (pcap_compile(handle, &fp, (char *)m_filter.c_str(), 0, net) == -1)
		throw runtime_error(str(boost::format("Couldn't parse filter %s: %s") % m_filter % pcap_geterr(handle)));

	/* apply the compiled filter */
	if (pcap_setfilter(handle, &fp) == -1)
		throw runtime_error(str(boost::format("Couldn't install filter %s: %s") % m_filter % pcap_geterr(handle)));

	/* now we can set our callback function */
	pcap_loop(handle, 0, got_packet_wrapper, (u_char *) this);

	/* cleanup */
	pcap_freecode(&fp);
	pcap_close(handle);
}

void HttpSniffer::got_packet(const struct pcap_pkthdr *header, const u_char *packet)
{
	/* declare pointers to packet headers */
	const struct sniff_ethernet *ethernet;  /* The ethernet header [1] */
	const struct sniff_ip  *ip;             /* The IP header */
	const struct sniff_ip6 *ip6;            /* The IPv6 header */
	const struct sniff_tcp *tcp;            /* The TCP header */
	const char *payload;                    /* Packet payload */

	int size_ip;
	int size_tcp;
	int size_payload;
	
	int ip_len;
	
	string from;
	string to;
	
	/* define ethernet header */
	ethernet = (struct sniff_ethernet*)(packet);
	
	/* define/compute ip header offset */
	u_short ether_type = ntohs(ethernet->ether_type);
	switch (ether_type) {
		case ETHERTYPE_IP:
			ip = (struct sniff_ip*)(packet + SIZE_ETHERNET);
			size_ip = IP_HL(ip)*4;
			if (size_ip < 20)
				throw runtime_error(str(boost::format("Invalid IPv4 header length: %u bytes") % size_ip));
			ip_len = ntohs(ip->ip_len);
			break;
		
		case ETHERTYPE_IPV6:
			// FIXME: Support IPv6 extension headers?
			ip6 = (struct sniff_ip6*)(packet + SIZE_ETHERNET);
			size_ip = 40;
			ip_len = ntohs(ip6->ip6_plen);
			break;
		
		default:
			cout << (boost::format("Ignoring unknown ethernet packet with type %x") % ntohs(ethernet->ether_type)) << endl;
			return;
	}
	
	/* ignore non tcp packets */
	if (ip->ip_p != IPPROTO_TCP && ip6->ip6_nxt != IPPROTO_TCP)
		return;
	
	/* define tcp header */
	tcp = (struct sniff_tcp*)(packet + SIZE_ETHERNET + size_ip);
	size_tcp = TH_OFF(tcp)*4;
	if (size_tcp < 20)
		throw runtime_error(str(boost::format("Invalid TCP header length: %u bytes") % size_tcp));

	/* get source/dest */
	if (ether_type == ETHERTYPE_IP) {
		from = str(boost::format("%s:%d") % inet_ntoa(ip->ip_src) % ntohs(tcp->th_sport));
		to   = str(boost::format("%s:%d") % inet_ntoa(ip->ip_dst) % ntohs(tcp->th_dport));
	} else {	
		char src_addr_buf[INET6_ADDRSTRLEN];
		inet_ntop(AF_INET6, &ip6->ip6_src, src_addr_buf, sizeof(src_addr_buf));
		
		char dst_addr_buf[INET6_ADDRSTRLEN];
		inet_ntop(AF_INET6, &ip6->ip6_dst, dst_addr_buf, sizeof(src_addr_buf));
		
		from = str(boost::format("[%s]:%d") % string(src_addr_buf) % ntohs(tcp->th_sport));
		to   = str(boost::format("[%s]:%d") % string(dst_addr_buf) % ntohs(tcp->th_dport));
	}
	
	/* define/compute tcp payload (segment) offset */
	payload = (const char *)(packet + SIZE_ETHERNET + size_ip + size_tcp);
	
	/* compute tcp payload (segment) size */
	size_payload = ip_len - (size_ip + size_tcp);
	
	string key;
	key.append(from);
	key.append("-");
	key.append(to);
	
	HttpPacket *http_packet = 0;
	
	PacketCacheMap::iterator iter;
	iter = m_pending_packets.find(key);
	
	if (iter == m_pending_packets.end())
		http_packet = new HttpPacket(from, to);
	else {
		http_packet = iter->second;
		m_pending_packets.erase(iter);
	}
	
	if (http_packet->parse(payload, size_payload)) {
		if (http_packet->isComplete()) {
			m_callback(http_packet);
			delete http_packet;
		} else {
			m_pending_packets[key] = http_packet;
		}
	} else {
		delete http_packet;
	}
}
