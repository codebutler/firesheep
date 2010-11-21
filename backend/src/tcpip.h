//
// tcpip.h
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

#include <sys/types.h>
#include <netinet/in.h>
#include <arpa/inet.h>

/* default snap length (maximum bytes per packet to capture) */
#define SNAP_LEN 1518

/* ethernet headers are always exactly 14 bytes [1] */
#define SIZE_ETHERNET 14

/* Ethernet addresses are 6 bytes */
#define ETHER_ADDR_LEN	6

/* Support __packed__ on visual studio */
#ifdef PLATFORM_WIN32
#define PACK_START __pragma(pack(push, 1))
#define PACK_END __pragma(pack(pop))
#else
#define PACK_START
#define PACK_END __attribute__((__packed__));
#endif

/* Radiotap header */
PACK_START
struct radiotap_header {
	u_int8_t	it_version;	/* set to 0 */
	u_int8_t	it_pad;
	u_int16_t	it_len;		/* entire length */
	u_int32_t	it_present;	/* fields present */
}PACK_END;


/* SNAP LLC header */
PACK_START
struct snap_llc_header           
{
	u_int8_t	dsap; 
	u_int8_t	ssap;
	u_int8_t	ctl;
	u_int16_t	org; 
	u_int8_t	org2;
	u_int16_t	ether_type;	/* ethernet type */              
}PACK_END;


/* 802.11 Generic header */
PACK_START
struct wifi_header {
	u_int16_t fc;
	u_int16_t duration;
	u_int8_t da[6];
	u_int8_t sa[6];
	u_int8_t bssid[6];
	u_int16_t seq_ctrl;
}PACK_END;

/*
 * Bits in the frame control field.
 */
#define FC_TYPE(fc) (((fc) >> 2) & 0x3)
#define FC_SUBTYPE(fc) (((fc) >> 4) & 0xF)
#define FC_TO_DS(fc) ((fc) & 0x0100)
#define FC_FROM_DS(fc) ((fc) & 0x0200)

/* Type data */
#define	T_DATA 0x2 

/* Subtype QoS data */
#define DATA_FRAME_IS_QOS(x) ((x) & 0x08)

/* Ethernet header */
PACK_START
struct sniff_ethernet {
	u_char  ether_dhost[ETHER_ADDR_LEN];    /* destination host address */
	u_char  ether_shost[ETHER_ADDR_LEN];    /* source host address */
	u_short ether_type;                     /* IP? ARP? RARP? etc */
}PACK_END;

#define	ETHERTYPE_IP		0x0800	/* IP protocol */
#define ETHERTYPE_IPV6		0x86dd	/* IPv6 */

/* IP header */
PACK_START
struct sniff_ip {
	u_char  ip_vhl;                 /* version << 4 | header length >> 2 */
	u_char  ip_tos;                 /* type of service */
	u_short ip_len;                 /* total length */
	u_short ip_id;                  /* identification */
	u_short ip_off;                 /* fragment offset field */
	#define IP_RF 0x8000            /* reserved fragment flag */
	#define IP_DF 0x4000            /* dont fragment flag */
	#define IP_MF 0x2000            /* more fragments flag */
	#define IP_OFFMASK 0x1fff       /* mask for fragmenting bits */
	u_char  ip_ttl;                 /* time to live */
	u_char  ip_p;                   /* protocol */
	u_short ip_sum;                 /* checksum */
	struct  in_addr ip_src,ip_dst;  /* source and dest address */
}PACK_END;
#define IP_HL(ip)               (((ip)->ip_vhl) & 0x0f)
#define IP_V(ip)                (((ip)->ip_vhl) >> 4)

PACK_START
struct sniff_ip6 {
	union {
		struct ip6_hdrctl {
  		u_int32_t ip6_un1_flow; // 20 bits of flow-ID
  		u_int16_t ip6_un1_plen; // payload length
  		u_int8_t  ip6_un1_nxt;  // next header
  		u_int8_t  ip6_un1_hlim; // hop limit
		} ip6_un1;
		u_int8_t ip6_un2_vfc;   // 4 bits version, top 4 bits class
	} ip6_ctlun;
	struct in6_addr ip6_src;        // source address
	struct in6_addr ip6_dst;        // destination address
}PACK_END;

#define ip6_vfc   ip6_ctlun.ip6_un2_vfc
#define ip6_flow  ip6_ctlun.ip6_un1.ip6_un1_flow
#define ip6_plen  ip6_ctlun.ip6_un1.ip6_un1_plen
#define ip6_nxt   ip6_ctlun.ip6_un1.ip6_un1_nxt
#define ip6_hlim  ip6_ctlun.ip6_un1.ip6_un1_hlim
#define ip6_hops  ip6_ctlun.ip6_un1.ip6_un1_hlim

/* TCP header */
typedef u_int tcp_seq;

PACK_START
struct sniff_tcp {
	u_short th_sport;               /* source port */
	u_short th_dport;               /* destination port */
	tcp_seq th_seq;                 /* sequence number */
	tcp_seq th_ack;                 /* acknowledgement number */
	u_char  th_offx2;               /* data offset, rsvd */
	#define TH_OFF(th)      (((th)->th_offx2 & 0xf0) >> 4)
	u_char  th_flags;
	#define TH_FIN  0x01
	#define TH_SYN  0x02
	#define TH_RST  0x04
	#define TH_PUSH 0x08
	#define TH_ACK  0x10
	#define TH_URG  0x20
	#define TH_ECE  0x40
	#define TH_CWR  0x80
	#define TH_FLAGS        (TH_FIN|TH_SYN|TH_RST|TH_ACK|TH_URG|TH_ECE|TH_CWR)
	u_short th_win;                 /* window */
	u_short th_sum;                 /* checksum */
	u_short th_urp;                 /* urgent pointer */
}PACK_END;

#undef PACK_START
#undef PACK_END
