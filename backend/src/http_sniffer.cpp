//
// http_sniffer.cpp
// Part of the Firesheep project.
//
// Copyright (C) 2010 Eric Butler
//
// Authors:
//   Eric Butler <eric@codebutler.com>
//   Nick kossifidis <mickflemm@gmail.com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// Based on http://www.tcpdump.org/pcap.htm
// http://www.tcpdump.org/sniffex.c

#include <boost/format.hpp>
#include <pcap.h>
#include "http_sniffer.hpp"
#include "http_packet.hpp"
#include "tcpip.h"

HttpSniffer::HttpSniffer (string iface, string filter, http_packet_cb callback)
  : m_iface(iface), m_filter(filter), m_callback(callback) { m_wifimon = 0; }

void HttpSniffer::start()
{
  char errbuf[PCAP_ERRBUF_SIZE];    /* error buffer */
  pcap_t *handle;       /* packet capture handle */

  struct bpf_program fp;      /* compiled filter program
             * (expression) */
  /* XXX: IPv6 has longer net/mask ! */
  bpf_u_int32 mask = 0;     /* subnet mask */
  bpf_u_int32 net  = 0;     /* ip */

  /* Open capture device in promisc mode */
  handle = pcap_open_live(m_iface.c_str(), SNAP_LEN, 1, 1000, errbuf);
  if (handle == NULL)
    throw runtime_error(str(boost::format("Couldn't open device %s: %s") % m_iface % errbuf));
  
  /* Make sure we're capturing on an Ethernet or 802.11 monitor device */
  if (pcap_datalink(handle) == DLT_IEEE802_11_RADIO)
    m_wifimon = true;
  else if (pcap_datalink(handle) != DLT_EN10MB) {
    throw runtime_error(str(boost::format("%s is not supported (unsupported data link)") % m_iface));

  /* Make sure our ethernet interface has an IP address set */
  } else if (pcap_lookupnet(m_iface.c_str(), &net, &mask, errbuf) == -1)
    throw runtime_error(str(boost::format("Coudn't get ip/netmask for device %s: %s") % m_iface % errbuf));

  /*  Compile the filter expression */
  if (pcap_compile(handle, &fp, (char *)m_filter.c_str(), 0, net) == -1)
    throw runtime_error(str(boost::format("Couldn't parse filter %s: %s") % m_filter % pcap_geterr(handle)));

  /* Apply the compiled filter */
  if (pcap_setfilter(handle, &fp) == -1)
    throw runtime_error(str(boost::format("Couldn't install filter %s: %s") % m_filter % pcap_geterr(handle)));

  /* Now we can set our callback function */
  pcap_loop(handle, 0, got_packet_wrapper, (u_char *) this);

  /* Cleanup */
  pcap_freecode(&fp);
  pcap_close(handle);
}

void HttpSniffer::got_packet(const struct pcap_pkthdr *header, const u_char *packet)
{
  /* Declare pointers to packet headers */
  const struct radiotap_header *radiotap; /* The Radiotap header */
  const struct wifi_header *hdr80211; /* The 802.11 header */
  const struct snap_llc_header *snap_llc; /* The SNAP LLC header */
  const struct sniff_ethernet *ethernet;  /* The Ethernet header [1] */
  const struct sniff_ip  *ip = NULL;  /* The IP header */
  const struct sniff_ip6 *ip6 = NULL; /* The IPv6 header */
  const struct sniff_tcp *tcp;    /* The TCP header */
  const char *payload;  /* Packet payload */

  /* Declare header lengths */
  int size_ip;    /* Size of IP header in bytes */
  int size_tcp;   /* Size of TCP header << */
  int size_payload; /* Size of data in bytes  << */
  int size_radiotap;  /* Size of Radiotap header  << */
  int size_80211;   /* Size of 802.11 header << */

  /* Layer 3 header offset */
  int l3hdr_off = SIZE_ETHERNET;

  /* Total IP packet length */
  int ip_len;

  u_int16_t fc;
  u_short ether_type;
  string from;
  string to;

  /* 802.11 monitor support... */
  if (m_wifimon) {
    /* Get Radiotap header length (variable) */
    radiotap = (struct radiotap_header*)(packet);
    size_radiotap = radiotap->it_len;

    /* Calculate 802.11 header length (variable) */
    hdr80211 = (struct wifi_header*)(packet + size_radiotap);
    fc = hdr80211->fc;

    if (FC_TYPE(fc) == T_DATA) {
      size_80211 = (FC_TO_DS(fc) && FC_FROM_DS(fc)) ? 30 : 24;
      if (DATA_FRAME_IS_QOS(FC_SUBTYPE(fc))) {
        size_80211 += 2;
      }
    } else {
      cerr << (boost::format("Ignoring non-data frame 0x%x\n") % fc);
      return;
    }

    /* Set Layer 3 header offset (snap_llc_header has standard length) */
    l3hdr_off = size_80211 + size_radiotap + sizeof(struct snap_llc_header);

    /* Check ether_type */
    snap_llc = (struct snap_llc_header*)(packet + size_80211 + size_radiotap);
    ether_type = ntohs(snap_llc->ether_type);
    if (ether_type != ETHERTYPE_IP) {
      cerr << (boost::format("Ignoring unknown ethernet packet with type 0x%x\n") % ether_type);
      return;
    }

    /* Check and set IP header size and total packet length */
    ip = (struct sniff_ip*)(packet + l3hdr_off);
      size_ip = IP_HL(ip)*4;
    if (size_ip < 20) {
      /* Don't throw exception because on 802.11 monitor interfaces
       * we can have malformed packets, just skip it */
      cerr << (boost::format("Bad IP length: %d\n") % size_ip);
      return;
    }
    ip_len = ntohs(ip->ip_len);
  } else {
    /* Define ethernet header */
    ethernet = (struct sniff_ethernet*)(packet);

    /* Check ether_type */
    ether_type = ntohs(ethernet->ether_type);
    switch (ether_type) {
      case ETHERTYPE_IP:
        /* Check and set IP header size and total packet length */
        ip = (struct sniff_ip*)(packet + l3hdr_off);
        size_ip = IP_HL(ip)*4;
        if (size_ip < 20)
          throw runtime_error(str(boost::format("Invalid IPv4 header length: %u bytes") % size_ip));
        ip_len = ntohs(ip->ip_len);
        break;
      case ETHERTYPE_IPV6:
        /* Check and set IP header size and total packet length */
        // FIXME: Support IPv6 extension headers?
        ip6 = (struct sniff_ip6*)(packet + l3hdr_off);
        size_ip = 40;
        ip_len = ntohs(ip6->ip6_plen);
        break;
      default:
        cerr << (boost::format("Ignoring unknown ethernet packet with type %x\n") % ether_type);
        return;
    }
  }
  
  /* Ignore non tcp packets */
  if (!((ip && ip->ip_p == IPPROTO_TCP) || (ip6 && ip6->ip6_nxt == IPPROTO_TCP)))
    return;
  
  /* Check and set TCP header size */
  tcp = (struct sniff_tcp*)(packet + l3hdr_off + size_ip);
  size_tcp = TH_OFF(tcp)*4;
  if (size_tcp < 20) {
    /* Don't throw exception because on 802.11 monitor interfaces
     * we can have malformed packets, just skip it */
    if (!m_wifimon)
      throw runtime_error(str(boost::format("Invalid TCP header length: %u bytes") % size_tcp));
    else
      cerr << (boost::format("Invalid TCP header length: %u bytes") % size_tcp);
    return;
  }

  /* Get source/dest */
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
  
  /* Define/compute tcp payload (segment) offset */
  payload = (const char *)(packet + l3hdr_off + size_ip + size_tcp);
  
  /* Compute tcp payload (segment) size */
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
