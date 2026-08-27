// Campus Network Simulator Application Logic

// --- 1. NETWORK DEVICE DATA & SPECIFICATIONS ---
const DEVICES = {
    "CORE-SW-A": {
        name: "CORE-SW-A",
        tier: "Core Layer",
        model: "Cisco Catalyst C9500-32C",
        ip: "10.255.255.1/32",
        capacity: "3.2 - 6.4 Tbps",
        rate: "Up to 2.0 Bpps",
        ports: [
            { name: "TenGig1/0/1", status: "up", speed: "10 Gbps", desc: "Transit to ACAD-DIST" },
            { name: "TenGig1/0/2", status: "up", speed: "10 Gbps", desc: "Transit to HOSTEL-DIST" },
            { name: "TenGig1/0/3", status: "up", speed: "10 Gbps", desc: "Transit to LIBADMIN-DIST" },
            { name: "FortyGig1/1/1", status: "up", speed: "40 Gbps", desc: "StackWise Virtual Link (SVL)" }
        ],
        config: `! CORE-SW-A GLOBAL CONFIGURATION
hostname CORE-SW-A
!
! Enable StackWise Virtual
stackwise-virtual
 domain 1
!
interface StackWise-Virtual Link 1
 switchport mode stackwise-virtual
 exit
!
! Loopback Interface for Stable OSPF Router ID
interface Loopback0
 description OSPF Router ID & Management Loopback
 ip address 10.255.255.1 255.255.255.255
 exit
!
! Routed Transit Interfaces to Building MDF Distribution Switches
interface TenGigabitEthernet1/0/1
 description Transit Link to ACAD-DIST-A
 no switchport
 ip address 10.100.255.1 255.255.255.252
 ip ospf network point-to-point
 bfd interval 50 min_rx 50 multiplier 3
 ip ospf bfd
 exit
!
interface TenGigabitEthernet1/0/2
 description Transit Link to HOSTEL-DIST-A
 no switchport
 ip address 10.100.255.9 255.255.255.252
 ip ospf network point-to-point
 bfd interval 50 min_rx 50 multiplier 3
 ip ospf bfd
 exit
!
interface TenGigabitEthernet1/0/3
 description Transit Link to LIBADMIN-DIST-A
 no switchport
 ip address 10.100.255.17 255.255.255.252
 ip ospf network point-to-point
 bfd interval 50 min_rx 50 multiplier 3
 ip ospf bfd
 exit
!
! OSPF Dynamic Routing Configuration (Backbone Area 0)
router ospf 1
 router-id 10.255.255.1
 log-adjacency-changes
 passive-interface default
 no passive-interface TenGigabitEthernet1/0/1
 no passive-interface TenGigabitEthernet1/0/2
 no passive-interface TenGigabitEthernet1/0/3
 network 10.100.255.0 0.0.0.3 area 0
 network 10.100.255.8 0.0.0.3 area 0
 network 10.100.255.16 0.0.0.3 area 0
 network 10.255.255.1 0.0.0.0 area 0
 exit`
    },
    "CORE-SW-B": {
        name: "CORE-SW-B",
        tier: "Core Layer",
        model: "Cisco Catalyst C9500-32C",
        ip: "10.255.255.2/32",
        capacity: "3.2 - 6.4 Tbps",
        rate: "Up to 2.0 Bpps",
        ports: [
            { name: "TenGig1/0/1", status: "up", speed: "10 Gbps", desc: "Transit to ACAD-DIST" },
            { name: "TenGig1/0/2", status: "up", speed: "10 Gbps", desc: "Transit to HOSTEL-DIST" },
            { name: "TenGig1/0/3", status: "up", speed: "10 Gbps", desc: "Transit to LIBADMIN-DIST" },
            { name: "FortyGig1/1/1", status: "up", speed: "40 Gbps", desc: "StackWise Virtual Link (SVL)" }
        ],
        config: `! CORE-SW-B GLOBAL CONFIGURATION
hostname CORE-SW-B
!
! Enable StackWise Virtual
stackwise-virtual
 domain 1
!
interface StackWise-Virtual Link 1
 switchport mode stackwise-virtual
 exit
!
interface Loopback0
 description OSPF Router ID & Management Loopback
 ip address 10.255.255.2 255.255.255.255
 exit
!
interface TenGigabitEthernet1/0/1
 description Transit Link to ACAD-DIST-B
 no switchport
 ip address 10.100.255.5 255.255.255.252
 ip ospf network point-to-point
 bfd interval 50 min_rx 50 multiplier 3
 ip ospf bfd
 exit
!
interface TenGigabitEthernet1/0/2
 description Transit Link to HOSTEL-DIST-B
 no switchport
 ip address 10.100.255.13 255.255.255.252
 ip ospf network point-to-point
 bfd interval 50 min_rx 50 multiplier 3
 ip ospf bfd
 exit
!
router ospf 1
 router-id 10.255.255.2
 log-adjacency-changes
 passive-interface default
 no passive-interface TenGigabitEthernet1/0/1
 no passive-interface TenGigabitEthernet1/0/2
 network 10.100.255.4 0.0.0.3 area 0
 network 10.100.255.12 0.0.0.3 area 0
 network 10.255.255.2 0.0.0.0 area 0
 exit`
    },
    "ACAD-DIST": {
        name: "ACAD-DIST",
        tier: "Distribution Layer",
        model: "Cisco Catalyst C9300X-24Y",
        ip: "10.255.255.5/32",
        capacity: "Up to 1.0 Tbps (Stacked)",
        rate: "Up to 750 Mpps",
        ports: [
            { name: "TenGig1/0/1", status: "up", speed: "10 Gbps", desc: "Uplink to CORE-SW-A" },
            { name: "TenGig1/0/2", status: "up", speed: "10 Gbps", desc: "Uplink to CORE-SW-B" },
            { name: "TenGig1/0/10", status: "up", speed: "10 Gbps", desc: "Downlink to ACAD-1" },
            { name: "TenGig1/0/11", status: "up", speed: "10 Gbps", desc: "Downlink to ACAD-2" },
            { name: "TenGig1/0/12", status: "up", speed: "10 Gbps", desc: "Downlink to ACAD-3" }
        ],
        config: `! ACAD-DIST GLOBAL CONFIGURATION
hostname ACAD-DIST
!
vlan 10
 name ACAD1_STUDENT
vlan 11
 name ACAD1_FACULTY
vlan 12
 name ACAD1_IOT
vlan 20
 name ACAD2_STUDENT
vlan 21
 name ACAD2_FACULTY
vlan 30
 name ACAD3_STUDENT
vlan 31
 name ACAD3_FACULTY
vlan 99
 name MGMT_VLAN
exit
!
! SVIs (Default Gateways) with HSRP Setup
interface Vlan10
 description Gateway for Block 1 Students
 ip address 10.100.16.2 255.255.254.0
 ip helper-address 10.100.30.10  ! Central DHCP Server IP
 standby 10 ip 10.100.16.1
 standby 10 priority 110
 standby 10 preempt
 exit
!
interface Vlan11
 description Gateway for Block 1 Faculty
 ip address 10.100.18.2 255.255.255.0
 ip helper-address 10.100.30.10
 standby 11 ip 10.100.18.1
 standby 11 priority 110
 standby 11 preempt
 exit
!
! Management SVI
interface Vlan99
 description Out-of-Band Management SVI
 ip address 10.100.31.2 255.255.255.0
 exit
!
! Routed Uplink to Core Switch A
interface TenGigabitEthernet1/0/24
 description Routed Uplink to CORE-SW-A
 no switchport
 ip address 10.100.255.2 255.255.255.252
 ip ospf network point-to-point
 bfd interval 50 min_rx 50 multiplier 3
 ip ospf bfd
 exit
!
! OSPF Dynamic Routing Configuration (ABR)
router ospf 1
 router-id 10.255.255.5
 log-adjacency-changes
 passive-interface default
 no passive-interface TenGigabitEthernet1/0/24
 ! Summarize Block 1 subnets into Area 0
 area 2 range 10.100.16.0 255.255.252.0
 area 2 range 10.100.20.0 255.255.252.0
 area 2 range 10.100.24.0 255.255.252.0
 network 10.100.255.0 0.0.0.3 area 0
 network 10.100.16.0 0.0.1.255 area 2
 network 10.100.18.0 0.0.0.255 area 2
 network 10.100.20.0 0.0.1.255 area 2
 network 10.100.22.0 0.0.0.255 area 2
 network 10.255.255.5 0.0.0.0 area 0
 exit`
    },
    "HOSTEL-DIST": {
        name: "HOSTEL-DIST",
        tier: "Distribution Layer",
        model: "Cisco Catalyst C9300X-24Y",
        ip: "10.255.255.6/32",
        capacity: "Up to 1.0 Tbps",
        rate: "Up to 750 Mpps",
        ports: [
            { name: "TenGig1/0/1", status: "up", speed: "10 Gbps", desc: "Uplink to CORE-SW-A" },
            { name: "TenGig1/0/2", status: "up", speed: "10 Gbps", desc: "Uplink to CORE-SW-B" },
            { name: "TenGig1/0/10", status: "up", speed: "10 Gbps", desc: "Downlink to HOSTEL-1" },
            { name: "TenGig1/0/11", status: "up", speed: "10 Gbps", desc: "Downlink to HOSTEL-2" }
        ],
        config: `! HOSTEL-DIST GLOBAL CONFIGURATION
hostname HOSTEL-DIST
!
vlan 40
 name HOSTEL1_BYOD
vlan 50
 name HOSTEL2_BYOD
vlan 99
 name MGMT_VLAN
exit
!
interface Vlan40
 description Gateway for Hostel 1 BYOD
 ip address 10.100.0.2 255.255.248.0
 ip helper-address 10.100.30.10
 standby 40 ip 10.100.0.1
 standby 40 priority 110
 standby 40 preempt
 exit
!
interface Vlan50
 description Gateway for Hostel 2 BYOD
 ip address 10.100.8.2 255.255.248.0
 ip helper-address 10.100.30.10
 standby 50 ip 10.100.8.1
 standby 50 priority 110
 standby 50 preempt
 exit
!
! Traffic Shaping / Bandwidth Control during peak hours
class-map match-any HOSTEL-TRAFFIC
 match vlan 40
 match vlan 50
!
policy-map SHAPE-HOSTELS
 class HOSTEL-TRAFFIC
  shape average 400000000
!
interface TenGigabitEthernet1/0/10
 description Downlink to Hostel 1
 service-policy output SHAPE-HOSTELS
 exit
!
router ospf 1
 router-id 10.255.255.6
 log-adjacency-changes
 area 1 range 10.100.0.0 255.255.240.0
 network 10.100.255.8 0.0.0.3 area 0
 network 10.100.0.0 0.0.7.255 area 1
 network 10.100.8.0 0.0.7.255 area 1
 exit`
    },
    "LIBADMIN-DIST": {
        name: "LIBADMIN-DIST",
        tier: "Distribution Layer",
        model: "Cisco Catalyst C9300X-24Y",
        ip: "10.255.255.7/32",
        capacity: "Up to 1.0 Tbps",
        rate: "Up to 750 Mpps",
        ports: [
            { name: "TenGig1/0/1", status: "up", speed: "10 Gbps", desc: "Uplink to CORE-SW-A" },
            { name: "TenGig1/0/2", status: "up", speed: "10 Gbps", desc: "Uplink to CORE-SW-B" },
            { name: "TenGig1/0/10", status: "up", speed: "10 Gbps", desc: "Downlink to LIBRARY" },
            { name: "TenGig1/0/11", status: "up", speed: "10 Gbps", desc: "Downlink to ADMIN" }
        ],
        config: `! LIBADMIN-DIST GLOBAL CONFIGURATION
hostname LIBADMIN-DIST
!
vlan 60
 name LIBRARY_GUESTS
vlan 61
 name LIBRARY_STAFF
vlan 70
 name ADMIN_STAFF
vlan 99
 name MGMT_VLAN
exit
!
interface Vlan60
 ip address 10.100.28.2 255.255.255.0
 ip helper-address 10.100.30.10
 exit
!
interface Vlan61
 ip address 10.100.29.2 255.255.255.0
 ip helper-address 10.100.30.10
 exit
!
router ospf 1
 router-id 10.255.255.7
 area 3 range 10.100.28.0 255.255.252.0
 network 10.100.255.16 0.0.0.3 area 0
 network 10.100.28.0 0.0.0.255 area 3
 network 10.100.29.0 0.0.0.255 area 3
 network 10.100.30.0 0.0.0.255 area 3
 exit`
    },
    "EDGE-A": {
        name: "EDGE-A",
        tier: "Internet Edge",
        model: "Cisco ASR 1001-X",
        ip: "10.255.255.3/32",
        capacity: "Up to 36 Gbps",
        rate: "Flow-dependent",
        ports: [
            { name: "Gig0/0/0", status: "up", speed: "1 Gbps", desc: "Link to ISP-A (Primary)" },
            { name: "Gig0/0/1", status: "up", speed: "1 Gbps", desc: "Transit to CORE-SW-A" },
            { name: "Gig0/0/2", status: "up", speed: "1 Gbps", desc: "iBGP Sync Link to EDGE-B" }
        ],
        config: `! EDGE-ROUTER-A GLOBAL CONFIGURATION
hostname EDGE-ROUTER-A
!
! Public WAN Interface to ISP-A
interface GigabitEthernet0/0/0
 description Primary WAN Link to ISP-A
 ip address 198.51.100.1 255.255.255.252
 ip nat outside
 exit
!
! Inside LAN Interface to Core Switch A
interface GigabitEthernet0/0/1
 description Inside LAN Link to CORE-SW-A
 ip address 10.100.255.26 255.255.255.252
 ip nat inside
 exit
!
! PAT Pool Setup to Prevent NAT Port Exhaustion
ip nat pool WAN-PAT-POOL 198.51.100.2 198.51.100.30 netmask 255.255.255.224
ip nat inside source list NAT-ACL pool WAN-PAT-POOL overload
!
! NAT Access List (Campus IP range)
ip access-list standard NAT-ACL
 permit 10.100.0.0 0.0.255.255
 exit
!
! Dynamic eBGP Routing with ISP-A
router bgp 65100
 bgp log-neighbor-changes
 neighbor 198.51.100.2 remote-as 100
 neighbor 198.51.100.2 description Peer to ISP-A
 neighbor 198.51.100.2 route-map ISP-A-IN in
 neighbor 198.51.100.2 route-map ISP-A-OUT out
 !
 address-family ipv4
  neighbor 198.51.100.2 activate
  network 198.51.100.0 mask 255.255.255.224
  exit-address-family
 exit
!
! BGP Local Preference Route Maps
route-map ISP-A-IN permit 10
 description Prefer ISP-A incoming traffic for faculty/research
 set local-preference 200
 exit
!
! Dynamic OSPF routing process (Inject Default Route to Core)
router ospf 1
 router-id 10.255.255.3
 network 10.100.255.24 0.0.0.3 area 0
 default-information originate
 exit`
    },
    "EDGE-B": {
        name: "EDGE-B",
        tier: "Internet Edge",
        model: "Cisco Catalyst 8300-1N1S",
        ip: "10.255.255.4/32",
        capacity: "Up to 19.7 Gbps",
        rate: "Flow-dependent",
        ports: [
            { name: "Gig0/0/0", status: "up", speed: "1 Gbps", desc: "Link to ISP-B (Secondary)" },
            { name: "Gig0/0/1", status: "up", speed: "1 Gbps", desc: "Transit to CORE-SW-B" },
            { name: "Gig0/0/2", status: "up", speed: "1 Gbps", desc: "iBGP Sync Link to EDGE-A" }
        ],
        config: `! EDGE-ROUTER-B GLOBAL CONFIGURATION
hostname EDGE-ROUTER-B
!
interface GigabitEthernet0/0/0
 description Secondary WAN Link to ISP-B
 ip address 203.0.113.1 255.255.255.252
 ip nat outside
 exit
!
interface GigabitEthernet0/0/1
 description Inside LAN Link to CORE-SW-B
 ip address 10.100.255.30 255.255.255.252
 ip nat inside
 exit
!
ip nat pool WAN-PAT-POOL-B 203.0.113.2 203.0.113.14 netmask 255.255.255.240
ip nat inside source list NAT-ACL pool WAN-PAT-POOL-B overload
!
ip access-list standard NAT-ACL
 permit 10.100.0.0 0.0.255.255
 exit
!
router bgp 65100
 neighbor 203.0.113.2 remote-as 200
 neighbor 203.0.113.2 description Peer to ISP-B
 neighbor 203.0.113.2 route-map ISP-B-IN in
 !
 address-family ipv4
  neighbor 203.0.113.2 activate
  exit-address-family
 exit
!
route-map ISP-B-IN permit 10
 set local-preference 100  ! Lower preference
 exit
!
router ospf 1
 router-id 10.255.255.4
 network 10.100.255.28 0.0.0.3 area 0
 default-information originate
 exit`
    },
    "ACAD-1": {
        name: "ACAD-1",
        tier: "Access Layer",
        model: "Cisco Catalyst 9300-48UXM (UPOE)",
        ip: "10.100.16.10/23 (Mgmt: .10)",
        capacity: "480 Gbps Stacking Bandwidth",
        rate: "Up to 500 Mpps",
        ports: [
            { name: "Gig1/0/1", status: "up", speed: "1 Gbps", desc: "Student Desktop in Lab 1" },
            { name: "Gig1/0/12", status: "up", speed: "1 Gbps", desc: "Faculty Workstation" },
            { name: "mGig1/0/45", status: "up", speed: "2.5 Gbps", desc: "Wi-Fi 6 AP (UPOE)" },
            { name: "TenGig1/1/1", status: "up", speed: "10 Gbps", desc: "Trunk to ACAD-DIST" }
        ],
        config: `! ACAD-ACCESS-1 CONFIGURATION
hostname ACAD-1
!
vlan 10
 name ACAD1_STUDENT
vlan 11
 name ACAD1_FACULTY
vlan 12
 name ACAD1_IOT
vlan 99
 name MGMT_VLAN
exit
!
ip dhcp snooping
ip dhcp snooping vlan 10,11,12,99
no ip dhcp snooping information option
ip arp inspection vlan 10,11,12,99
!
interface range GigabitEthernet1/0/1 - 40
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
 spanning-tree bpduguard enable
 ip dhcp snooping limit rate 100
 switchport port-security
 switchport port-security maximum 2
 switchport port-security violation restrict
 exit
!
interface range GigabitEthernet1/0/41 - 44
 switchport mode access
 switchport access vlan 11
 spanning-tree portfast
 spanning-tree bpduguard enable
 exit
!
interface GigabitEthernet1/0/45
 description Wi-Fi 6 AP Connection
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast trunk
 spanning-tree bpduguard enable
 ip dhcp snooping limit rate 150
 exit
!
interface Vlan99
 ip address 10.100.31.10 255.255.255.0
 exit
ip default-gateway 10.100.31.2
!
interface TenGigabitEthernet1/1/1
 description Trunk Link to ACAD-DIST
 switchport mode trunk
 switchport trunk allowed vlan 10,11,12,99
 ip dhcp snooping trust
 ip arp inspection trust
 exit`
    },
    "HOSTEL-1": {
        name: "HOSTEL-1",
        tier: "Access Layer",
        model: "Cisco Catalyst 9300-48UXM",
        ip: "10.100.0.10/21 (Mgmt: .20)",
        capacity: "480 Gbps Stacking",
        rate: "Up to 500 Mpps",
        ports: [
            { name: "Gig1/0/1", status: "up", speed: "1 Gbps", desc: "Student BYOD Room 101" },
            { name: "mGig1/0/45", status: "up", speed: "2.5 Gbps", desc: "Hostel AP (FlexConnect)" },
            { name: "TenGig1/1/1", status: "up", speed: "10 Gbps", desc: "Trunk to HOSTEL-DIST" }
        ],
        config: `! HOSTEL-ACCESS-A CONFIGURATION
hostname HOSTEL-1
!
vlan 40
 name HOSTEL1_PRIMARY
 private-vlan primary
 private-vlan association 401
!
vlan 401
 name HOSTEL1_ISOLATED
 private-vlan isolated
exit
!
vlan 99
 name MGMT_VLAN
exit
!
interface range GigabitEthernet1/0/1 - 44
 description Student BYOD Ports (Isolated)
 switchport mode private-vlan host
 switchport private-vlan host-association 40 401
 spanning-tree portfast
 spanning-tree bpduguard enable
 ip dhcp snooping limit rate 50
 exit
!
interface Vlan99
 ip address 10.100.31.20 255.255.255.0
 exit
ip default-gateway 10.100.31.2
!
interface TenGigabitEthernet1/1/1
 description Promiscuous Uplink to HOSTEL-DIST
 switchport mode private-vlan promiscuous
 switchport private-vlan mapping 40 401
 exit`
    }
};

// Boilerplate generator for visual nodes
["ACAD-2", "ACAD-3", "HOSTEL-2", "LIBRARY", "ADMIN"].forEach(nodeName => {
    if (!DEVICES[nodeName]) {
        let isHostel = nodeName.startsWith("HOSTEL");
        let isLibAdmin = ["LIBRARY", "ADMIN"].includes(nodeName);
        let specIp = isHostel ? "10.100.8.10/21" : (nodeName === "LIBRARY" ? "10.100.28.10/24" : "10.100.30.10/24");
        let vlanId = isHostel ? "50" : (nodeName === "LIBRARY" ? "60" : "70");
        let distNode = isHostel ? "HOSTEL-DIST" : (isLibAdmin ? "LIBADMIN-DIST" : "ACAD-DIST");
        
        DEVICES[nodeName] = {
            name: nodeName,
            tier: "Access Layer",
            model: "Cisco Catalyst 9300-48T",
            ip: specIp,
            capacity: "176 Gbps (Standalone)",
            rate: "Up to 130 Mpps",
            ports: [
                { name: "Gig1/0/1", status: "up", speed: "1 Gbps", desc: "User Port" },
                { name: "TenGig1/1/1", status: "up", speed: "10 Gbps", desc: `Trunk to ${distNode}` }
            ],
            config: `! ${nodeName} CONFIGURATION
hostname ${nodeName}
!
vlan ${vlanId}
 name ${nodeName}_VLAN
exit
!
interface range GigabitEthernet1/0/1 - 48
 switchport mode access
 switchport access vlan ${vlanId}
 spanning-tree portfast
 spanning-tree bpduguard enable
 exit
!
interface TenGigabitEthernet1/1/1
 description Uplink to ${distNode}
 switchport mode trunk
 switchport trunk allowed vlan ${vlanId},99
 exit`
        };
    }
});

// Host nodes (branching off access switches)
const HOST_DEVICES = {
    "PC-1": { name: "Lab PC 1 (Block 1)", ip: "10.100.16.50", gateway: "10.100.16.1", mac: "00:50:56:AB:CD:01", parent: "ACAD-1" },
    "IP-Phone": { name: "Faculty IP Phone", ip: "10.100.18.55", gateway: "10.100.18.1", mac: "00:50:56:AB:CD:02", parent: "ACAD-1" },
    "Laptop-1": { name: "Faculty Laptop (Block 2)", ip: "10.100.22.60", gateway: "10.100.22.1", mac: "00:50:56:AB:CD:03", parent: "ACAD-2" },
    "CCTV-1": { name: "Security Camera (Block 3)", ip: "10.100.27.80", gateway: "10.100.27.1", mac: "00:50:56:AB:CD:04", parent: "ACAD-3" },
    "Stud-Laptop": { name: "Student Laptop", ip: "10.100.1.120", gateway: "10.100.0.1", mac: "00:50:56:AB:CD:05", parent: "HOSTEL-1" },
    "Stud-Console": { name: "Student Console", ip: "10.100.9.140", gateway: "10.100.8.1", mac: "00:50:56:AB:CD:06", parent: "HOSTEL-2" },
    "Lib-Terminal": { name: "Library Catalog PC", ip: "10.100.28.45", gateway: "10.100.28.1", mac: "00:50:56:AB:CD:07", parent: "LIBRARY" },
    "Admin-PC": { name: "Admin Workstation", ip: "10.100.30.50", gateway: "10.100.30.1", mac: "00:50:56:AB:CD:08", parent: "ADMIN" }
};

// --- 2. IPAM DATABASE RECORDSET ---
const IPAM_REGISTRY = [
    { vlan: "VLAN 10", desc: "Block 1 Students & Lecture Halls", cidr: "10.100.16.0/23", mask: "255.255.254.0", range: "10.100.16.1 - 10.100.17.254", broadcast: "10.100.17.255", area: "2" },
    { vlan: "VLAN 11", desc: "Block 1 Faculty Workstations", cidr: "10.100.18.0/24", mask: "255.255.255.0", range: "10.100.18.1 - 10.100.18.254", broadcast: "10.100.18.255", area: "2" },
    { vlan: "VLAN 12", desc: "Block 1 localized IoT Devices", cidr: "10.100.19.0/24", mask: "255.255.255.0", range: "10.100.19.1 - 10.100.19.254", broadcast: "10.100.19.255", area: "2" },
    { vlan: "VLAN 20", desc: "Block 2 Students & Lecture Halls", cidr: "10.100.20.0/23", mask: "255.255.254.0", range: "10.100.20.1 - 10.100.21.254", broadcast: "10.100.21.255", area: "2" },
    { vlan: "VLAN 21", desc: "Block 2 Faculty Workstations", cidr: "10.100.22.0/24", mask: "255.255.255.0", range: "10.100.22.1 - 10.100.22.254", broadcast: "10.100.22.255", area: "2" },
    { vlan: "VLAN 22", desc: "Block 2 localized IoT Devices", cidr: "10.100.23.0/24", mask: "255.255.255.0", range: "10.100.23.1 - 10.100.23.254", broadcast: "10.100.23.255", area: "2" },
    { vlan: "VLAN 30", desc: "Block 3 Students & Lecture Halls", cidr: "10.100.24.0/23", mask: "255.255.254.0", range: "10.100.24.1 - 10.100.25.254", broadcast: "10.100.25.255", area: "2" },
    { vlan: "VLAN 31", desc: "Block 3 Faculty Workstations", cidr: "10.100.26.0/24", mask: "255.255.255.0", range: "10.100.26.1 - 10.100.26.254", broadcast: "10.100.26.255", area: "2" },
    { vlan: "VLAN 32", desc: "Block 3 localized IoT Devices", cidr: "10.100.27.0/24", mask: "255.255.255.0", range: "10.100.27.1 - 10.100.27.254", broadcast: "10.100.27.255", area: "2" },
    { vlan: "VLAN 40", desc: "Hostel 1 Student BYOD Clients", cidr: "10.100.0.0/21", mask: "255.255.248.0", range: "10.100.0.1 - 10.100.7.254", broadcast: "10.100.7.255", area: "1" },
    { vlan: "VLAN 50", desc: "Hostel 2 Student BYOD Clients", cidr: "10.100.8.0/21", mask: "255.255.248.0", range: "10.100.8.1 - 10.100.15.254", broadcast: "10.100.15.255", area: "1" },
    { vlan: "VLAN 60", desc: "Central Library Public & Guests", cidr: "10.100.28.0/24", mask: "255.255.255.0", range: "10.100.28.1 - 10.100.28.254", broadcast: "10.100.28.255", area: "3" },
    { vlan: "VLAN 61", desc: "Central Library Staff & Research", cidr: "10.100.29.0/24", mask: "255.255.255.0", range: "10.100.29.1 - 10.100.29.254", broadcast: "10.100.29.255", area: "3" },
    { vlan: "VLAN 70", desc: "Administration Executive & Staff", cidr: "10.100.30.0/24", mask: "255.255.255.0", range: "10.100.30.1 - 10.100.30.254", broadcast: "10.100.30.255", area: "3" },
    { vlan: "VLAN 99", desc: "Switch SVI OOB Management Pool", cidr: "10.100.31.0/24", mask: "255.255.255.0", range: "10.100.31.1 - 10.100.31.254", broadcast: "10.100.31.255", area: "3" },
    { vlan: "Loopbacks", desc: "Dynamic Routing Router IDs", cidr: "10.255.255.0/24", mask: "255.255.255.255", range: "10.255.255.1 - 10.255.255.15 (/32)", broadcast: "N/A", area: "0" },
    { vlan: "Transit /30", desc: "Core-to-Distribution Inter-Switch Links", cidr: "10.100.255.0/24", mask: "255.255.255.252", range: "10.100.255.1 - 10.100.255.254", broadcast: "N/A", area: "0" }
];

// --- 3. TOPOLOGY GRAPH COORDINATES ---
const NODES = {
    // Edge (Tier 0)
    "ISP-A": { x: 450, y: 50, label: "ISP-A (Primary Link)", type: "cloud" },
    "ISP-B": { x: 750, y: 50, label: "ISP-B (Secondary Link)", type: "cloud" },
    "EDGE-A": { x: 450, y: 130, label: "EDGE-A (ASR1001-X)", type: "router" },
    "EDGE-B": { x: 750, y: 130, label: "EDGE-B (Cat 8300)", type: "router" },
    
    // Core (Tier 1)
    "CORE-SW-A": { x: 450, y: 230, label: "CORE-SW-A (Cat 9500)", type: "core" },
    "CORE-SW-B": { x: 750, y: 230, label: "CORE-SW-B (Cat 9500)", type: "core" },
    
    // Distribution (Tier 2)
    "ACAD-DIST": { x: 250, y: 390, label: "ACAD-DIST (ABR)", type: "dist" },
    "HOSTEL-DIST": { x: 600, y: 390, label: "HOSTEL-DIST (ABR)", type: "dist" },
    "LIBADMIN-DIST": { x: 950, y: 390, label: "LIBADMIN-DIST (ABR)", type: "dist" },
    
    // Access (Tier 3)
    "ACAD-1": { x: 120, y: 530, label: "ACAD-1", type: "access" },
    "ACAD-2": { x: 250, y: 530, label: "ACAD-2", type: "access" },
    "ACAD-3": { x: 380, y: 530, label: "ACAD-3", type: "access" },
    
    "HOSTEL-1": { x: 530, y: 530, label: "HOSTEL-1 (PVLAN)", type: "access" },
    "HOSTEL-2": { x: 670, y: 530, label: "HOSTEL-2 (PVLAN)", type: "access" },
    
    "LIBRARY": { x: 880, y: 530, label: "LIBRARY", type: "access" },
    "ADMIN": { x: 1020, y: 530, label: "ADMIN", type: "access" },

    // Endpoints (Tier 4)
    "PC-1": { x: 80, y: 640, label: "PC-1 (V10)", type: "endpoint" },
    "IP-Phone": { x: 140, y: 640, label: "VoIP (V11)", type: "endpoint" },
    "Laptop-1": { x: 250, y: 640, label: "Laptop (V21)", type: "endpoint" },
    "CCTV-1": { x: 380, y: 640, label: "CCTV (V32)", type: "endpoint" },
    "Stud-Laptop": { x: 530, y: 640, label: "BYOD-1 (V40)", type: "endpoint" },
    "Stud-Console": { x: 670, y: 640, label: "BYOD-2 (V50)", type: "endpoint" },
    "Lib-Terminal": { x: 880, y: 640, label: "Terminal (V60)", type: "endpoint" },
    "Admin-PC": { x: 1020, y: 640, label: "Staff-PC (V70)", type: "endpoint" }
};

const LINKS = [
    // WAN
    { src: "ISP-A", dest: "EDGE-A", area: 0, sPort: "Gi0/0/0", dPort: "Fa0/1" },
    { src: "ISP-B", dest: "EDGE-B", area: 0, sPort: "Gi0/0/0", dPort: "Fa0/1" },
    
    // Edge to Core
    { src: "EDGE-A", dest: "CORE-SW-A", area: 0, sPort: "Gi0/0/1", dPort: "Te1/0/25" },
    { src: "EDGE-B", dest: "CORE-SW-B", area: 0, sPort: "Gi0/0/1", dPort: "Te1/0/25" },
    { src: "EDGE-A", dest: "EDGE-B", area: 0, sPort: "Gi0/0/2", dPort: "Gi0/0/2" }, // iBGP
    
    // Core SVL
    { src: "CORE-SW-A", dest: "CORE-SW-B", area: 0, sPort: "Fo1/1/1", dPort: "Fo1/1/1", type: "svl" },
    
    // Core to Dist
    { src: "CORE-SW-A", dest: "ACAD-DIST", area: 0, sPort: "Te1/0/1", dPort: "Te1/0/24" },
    { src: "CORE-SW-B", dest: "ACAD-DIST", area: 0, sPort: "Te1/0/1", dPort: "Te1/0/24" },
    { src: "CORE-SW-A", dest: "HOSTEL-DIST", area: 0, sPort: "Te1/0/2", dPort: "Te1/0/24" },
    { src: "CORE-SW-B", dest: "HOSTEL-DIST", area: 0, sPort: "Te1/0/2", dPort: "Te1/0/24" },
    { src: "CORE-SW-A", dest: "LIBADMIN-DIST", area: 0, sPort: "Te1/0/3", dPort: "Te1/0/24" },
    { src: "CORE-SW-B", dest: "LIBADMIN-DIST", area: 0, sPort: "Te1/0/3", dPort: "Te1/0/24" },
    
    // Dist to Access
    { src: "ACAD-DIST", dest: "ACAD-1", area: 2, sPort: "Te1/0/10", dPort: "Te1/1/1" },
    { src: "ACAD-DIST", dest: "ACAD-2", area: 2, sPort: "Te1/0/11", dPort: "Te1/1/1" },
    { src: "ACAD-DIST", dest: "ACAD-3", area: 2, sPort: "Te1/0/12", dPort: "Te1/1/1" },
    
    { src: "HOSTEL-DIST", dest: "HOSTEL-1", area: 1, sPort: "Te1/0/10", dPort: "Te1/1/1" },
    { src: "HOSTEL-DIST", dest: "HOSTEL-2", area: 1, sPort: "Te1/0/11", dPort: "Te1/1/1" },
    
    { src: "LIBADMIN-DIST", dest: "LIBRARY", area: 3, sPort: "Te1/0/10", dPort: "Te1/1/1" },
    { src: "LIBADMIN-DIST", dest: "ADMIN", area: 3, sPort: "Te1/0/11", dPort: "Te1/1/1" },

    // Access to Endpoints
    { src: "ACAD-1", dest: "PC-1", area: 2, sPort: "Gi1/0/1", dPort: "NIC", type: "eth" },
    { src: "ACAD-1", dest: "IP-Phone", area: 2, sPort: "Gi1/0/12", dPort: "LAN", type: "eth" },
    { src: "ACAD-2", dest: "Laptop-1", area: 2, sPort: "Gi1/0/20", dPort: "NIC", type: "eth" },
    { src: "ACAD-3", dest: "CCTV-1", area: 2, sPort: "Gi1/0/5", dPort: "NIC", type: "eth" },
    { src: "HOSTEL-1", dest: "Stud-Laptop", area: 1, sPort: "Gi1/0/1", dPort: "WLAN", type: "eth" },
    { src: "HOSTEL-2", dest: "Stud-Console", area: 1, sPort: "Gi1/0/3", dPort: "NIC", type: "eth" },
    { src: "LIBRARY", dest: "Lib-Terminal", area: 3, sPort: "Gi1/0/2", dPort: "NIC", type: "eth" },
    { src: "ADMIN", dest: "Admin-PC", area: 3, sPort: "Gi1/0/10", dPort: "NIC", type: "eth" }
];

// Areas Layout (Clean backing boxes)
const OSPF_AREAS_LAY = [
    { id: "lay-area0", x: 260, y: 100, width: 680, height: 180, label: "OSPF AREA 0 (BACKBONE)", color: "var(--area-0)" },
    { id: "lay-area2", x: 40, y: 320, width: 440, height: 380, label: "OSPF AREA 2 (ACADEMIC BLOCKS)", color: "var(--area-2)" },
    { id: "lay-area1", x: 490, y: 320, width: 280, height: 380, label: "OSPF AREA 1 (HOSTELS)", color: "var(--area-1)" },
    { id: "lay-area3", x: 780, y: 320, width: 380, height: 380, label: "OSPF AREA 3 (LIBRARY & ADMIN)", color: "var(--area-3)" }
];

// --- 4. DOM SELECTION ---
const svgCanvas = document.getElementById("topology-svg");
const inspectorPlaceholder = document.getElementById("inspector-placeholder");
const inspectorMain = document.getElementById("inspector-main");
const inspectName = document.getElementById("inspect-name");
const inspectTier = document.getElementById("inspect-tier");
const inspectAvatar = document.getElementById("inspect-avatar");
const specModel = document.getElementById("spec-model");
const specIp = document.getElementById("spec-ip");
const specCapacity = document.getElementById("spec-capacity");
const specRate = document.getElementById("spec-rate");
const inspectPorts = document.getElementById("inspect-ports");
const inspectCode = document.getElementById("inspect-code");
const btnCloseInspect = document.getElementById("btn-close-inspect");
const btnCopyCode = document.getElementById("btn-copy-code");
const btnStopSim = document.getElementById("btn-stop-sim");
const btnToggleOspf = document.getElementById("btn-toggle-ospf");
const btnToggleVlans = document.getElementById("btn-toggle-vlans");

// Tabs View Controllers
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");
const viewTabBtns = document.querySelectorAll(".view-tab-btn");
const viewPanes = document.querySelectorAll(".view-pane");

// Simulation trigger cards
const simCards = document.querySelectorAll(".sim-card");

// IPAM table controls
const ipamTbody = document.getElementById("ipam-tbody");
const ipamSearch = document.getElementById("ipam-search");
const ipamFilterArea = document.getElementById("ipam-filter-area");

// --- 5. INITIAL CONFIG STATES ---
let selectedNode = null;
let activeSim = null;
let simIntervals = [];
let showOspfOverlay = false;
let showVlanOverlay = false;

// --- 6. GEOMETRIC LINK TERMINATION PORT INTERPOLATOR ---
function getPortLabelCoords(x1, y1, x2, y2, d) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return { x: x1, y: y1 };
    
    // Interpolated coordinates at distance 'd'
    const x = x1 + (dx / len) * d;
    const y = y1 + (dy / len) * d;
    
    // Orthogonal offset to prevent text overlaying the line
    const ox = -(dy / len) * 8;
    const oy = (dx / len) * 8;
    
    return { x: x + ox, y: y + oy };
}

// --- 7. SVG TOPOLOGY RENDER ENGINE ---
function renderTopology() {
    svgCanvas.innerHTML = "";
    
    // 1. Defs, filters, symbols
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
    `;
    svgCanvas.appendChild(defs);

    // 2. Draw Backing OSPF Areas (Fills with very low opacity, toggled via state)
    OSPF_AREAS_LAY.forEach(area => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", area.x);
        rect.setAttribute("y", area.y);
        rect.setAttribute("width", area.width);
        rect.setAttribute("height", area.height);
        rect.setAttribute("rx", "14");
        rect.setAttribute("ry", "14");
        rect.setAttribute("id", area.id);
        
        // Dynamic opacity depending on active state
        rect.setAttribute("fill", showOspfOverlay ? `${area.color}0B` : "transparent");
        rect.setAttribute("stroke", showOspfOverlay ? area.color : "transparent");
        rect.setAttribute("stroke-width", "1.5");
        rect.setAttribute("stroke-dasharray", "4 4");
        rect.style.transition = "var(--transition-smooth)";
        
        svgCanvas.appendChild(rect);
        
        // Header Text block
        if (showOspfOverlay) {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", area.x + 16);
            text.setAttribute("y", area.y + 24);
            text.setAttribute("fill", area.color);
            text.setAttribute("font-size", "10px");
            text.setAttribute("font-weight", "bold");
            text.setAttribute("opacity", "0.75");
            text.textContent = area.label;
            svgCanvas.appendChild(text);
        }
    });

    // 3. Draw Links
    LINKS.forEach(link => {
        const src = NODES[link.src];
        const dest = NODES[link.dest];
        if (!src || !dest) return;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", src.x);
        line.setAttribute("y1", src.y);
        line.setAttribute("x2", dest.x);
        line.setAttribute("y2", dest.y);
        
        let linkClass = "link normal";
        if (link.type === "svl") {
            linkClass = "link normal svl-link";
            line.setAttribute("stroke-dasharray", "4 2");
        } else if (link.type === "eth") {
            linkClass = "link normal eth-link";
            line.setAttribute("stroke-width", "1.2");
            line.setAttribute("opacity", "0.4");
        } else {
            linkClass = `link area${link.area}`;
        }
        
        line.setAttribute("class", linkClass);
        line.setAttribute("id", `link-${link.src}-${link.dest}`);
        svgCanvas.appendChild(line);

        // Render port interface labels (Only for infrastructure links, not endpoint links)
        if (link.type !== "eth" && link.sPort && link.dPort) {
            const sCoords = getPortLabelCoords(src.x, src.y, dest.x, dest.y, 25);
            const dCoords = getPortLabelCoords(dest.x, dest.y, src.x, src.y, 25);
            
            const t1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
            t1.setAttribute("x", sCoords.x);
            t1.setAttribute("y", sCoords.y);
            t1.setAttribute("class", "port-label-svg");
            t1.setAttribute("text-anchor", "middle");
            t1.textContent = link.sPort;
            
            const t2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
            t2.setAttribute("x", dCoords.x);
            t2.setAttribute("y", dCoords.y);
            t2.setAttribute("class", "port-label-svg");
            t2.setAttribute("text-anchor", "middle");
            t2.textContent = link.dPort;
            
            svgCanvas.appendChild(t1);
            svgCanvas.appendChild(t2);
        }
    });

    // 4. Draw Nodes
    Object.keys(NODES).forEach(nodeKey => {
        const node = NODES[nodeKey];
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("class", "node-group");
        group.setAttribute("id", `node-${nodeKey}`);
        
        // Disable inspection click for hosts to keep layout clean
        if (node.type !== "endpoint") {
            group.addEventListener("click", () => selectDevice(nodeKey));
        }

        // Selection ring
        const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        ring.setAttribute("cx", node.x);
        ring.setAttribute("cy", node.y);
        ring.setAttribute("r", 18);
        ring.setAttribute("class", "node-outer-glow");
        ring.setAttribute("stroke", "var(--color-primary)");
        ring.setAttribute("stroke-width", "3");
        group.appendChild(ring);

        // Core Shapes & Colors
        let shape;
        if (node.type === "cloud") {
            shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
            shape.setAttribute("d", "M25,15 C25,12.2 22.8,10 20,10 C19.6,10 19.3,10.1 18.9,10.2 C17.8,7.7 15.1,6 12,6 C7.6,6 4,9.6 4,14 C4,14.3 4.0,14.7 4.1,15 C1.7,16 0,18.3 0,21 C0,24.9 3.1,28 7,28 L24,28 C28.4,28 32,24.4 32,20 C32,16.5 29,15.6 25,15 Z");
            shape.setAttribute("transform", `translate(${node.x - 16}, ${node.y - 14})`);
            shape.setAttribute("fill", "#475569");
            shape.setAttribute("class", "node-base");
        } else if (node.type === "endpoint") {
            // Smaller shapes for host terminals
            shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            shape.setAttribute("cx", node.x);
            shape.setAttribute("cy", node.y);
            shape.setAttribute("r", 8);
            shape.setAttribute("class", "node-base");
            shape.setAttribute("fill", "#475569");
        } else {
            shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            shape.setAttribute("cx", node.x);
            shape.setAttribute("cy", node.y);
            shape.setAttribute("r", 14);
            shape.setAttribute("class", "node-base");
            
            let color = "#cbd5e1";
            if (node.type === "core") color = "var(--area-0)";
            else if (node.type === "dist") color = "var(--color-amber)";
            else if (node.type === "access") color = "var(--color-green)";
            else if (node.type === "router") color = "var(--color-red)";
            shape.setAttribute("fill", color);
        }
        group.appendChild(shape);

        // Core Text Symbol Overlay
        if (node.type !== "cloud" && node.type !== "endpoint") {
            const sym = document.createElementNS("http://www.w3.org/2000/svg", "text");
            sym.setAttribute("x", node.x);
            sym.setAttribute("y", node.y + 4);
            sym.setAttribute("fill", "#090d16");
            sym.setAttribute("font-size", "10px");
            sym.setAttribute("font-weight", "bold");
            sym.setAttribute("text-anchor", "middle");
            
            if (node.type === "core") sym.textContent = "C";
            else if (node.type === "dist") sym.textContent = "D";
            else if (node.type === "access") sym.textContent = "A";
            else if (node.type === "router") sym.textContent = "R";
            
            group.appendChild(sym);
        }

        // Host symbol overlay
        if (node.type === "endpoint") {
            const sym = document.createElementNS("http://www.w3.org/2000/svg", "text");
            sym.setAttribute("x", node.x);
            sym.setAttribute("y", node.y + 2.5);
            sym.setAttribute("fill", "#ffffff");
            sym.setAttribute("font-size", "7px");
            sym.setAttribute("font-weight", "bold");
            sym.setAttribute("text-anchor", "middle");
            sym.textContent = "H";
            group.appendChild(sym);
        }

        // Labels
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", node.x);
        label.setAttribute("y", node.y + (node.type === "endpoint" ? 20 : 28));
        label.setAttribute("class", "node-label");
        label.textContent = nodeKey;
        group.appendChild(label);

        // Subtext / IP Overlay
        const subtext = document.createElementNS("http://www.w3.org/2000/svg", "text");
        subtext.setAttribute("x", node.x);
        subtext.setAttribute("y", node.y + (node.type === "endpoint" ? 28 : 38));
        subtext.setAttribute("class", "node-subtext");
        
        if (showVlanOverlay) {
            // Display Subnet mapping
            if (node.type === "endpoint" && HOST_DEVICES[nodeKey]) {
                subtext.textContent = HOST_DEVICES[nodeKey].ip;
            } else if (DEVICES[nodeKey]) {
                subtext.textContent = DEVICES[nodeKey].ip.split(" ")[0];
            } else {
                subtext.textContent = "";
            }
            subtext.setAttribute("fill", "var(--color-primary)");
        } else {
            // Standard Descriptions
            let desc = "";
            if (node.type === "cloud") desc = "WAN Gateway";
            else if (node.type === "core") desc = "Core SVL Node";
            else if (node.type === "dist") desc = "MDF Dist ABR";
            else if (node.type === "access") desc = "IDF Access Switch";
            else if (node.type === "endpoint" && HOST_DEVICES[nodeKey]) desc = HOST_DEVICES[nodeKey].name;
            else if (node.type === "router") desc = "Edge Gateway";
            subtext.textContent = desc;
            subtext.setAttribute("fill", "var(--text-secondary)");
        }
        
        group.appendChild(subtext);
        svgCanvas.appendChild(group);
    });
}

// --- 8. INSPECTOR CONTROLLER ---
function selectDevice(nodeKey) {
    document.querySelectorAll(".node-group").forEach(el => el.classList.remove("selected"));
    const group = document.getElementById(`node-${nodeKey}`);
    if (group) group.classList.add("selected");

    selectedNode = nodeKey;
    const data = DEVICES[nodeKey];
    if (!data) return;

    inspectorPlaceholder.classList.add("hide");
    inspectorMain.classList.remove("hide");

    inspectName.textContent = data.name;
    inspectTier.textContent = data.tier;
    
    inspectAvatar.className = "device-avatar";
    if (data.tier === "Core Layer") {
        inspectAvatar.classList.add("core");
        inspectAvatar.textContent = "C";
    } else if (data.tier === "Distribution Layer") {
        inspectAvatar.classList.add("dist");
        inspectAvatar.textContent = "D";
    } else if (data.tier === "Access Layer") {
        inspectAvatar.classList.add("access");
        inspectAvatar.textContent = "A";
    } else {
        inspectAvatar.classList.add("edge");
        inspectAvatar.textContent = "R";
    }

    specModel.textContent = data.model;
    specIp.textContent = data.ip;
    specCapacity.textContent = data.capacity;
    specRate.textContent = data.rate;

    inspectPorts.innerHTML = "";
    data.ports.forEach(port => {
        const li = document.createElement("li");
        li.className = "port-item";
        li.innerHTML = `
            <span class="port-name">${port.name} (${port.desc})</span>
            <span class="port-status">
                <span class="port-dot ${port.status}"></span>
                ${port.status.toUpperCase()} (${port.speed})
            </span>
        `;
        inspectPorts.appendChild(li);
    });

    inspectCode.textContent = data.config;
}

// --- 9. VIEW CONTROLLER (TOPOLOGY VS IPAM TABLE) ---
function switchView(e) {
    const viewName = e.target.getAttribute("data-view");
    
    viewTabBtns.forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    
    viewPanes.forEach(pane => {
        pane.classList.remove("active");
        if (pane.id === `view-${viewName}`) {
            pane.classList.add("active");
        }
    });

    if (viewName === "ipam") {
        renderIpamTable();
    }
}

// --- 10. IPAM RENDER ENGINE & FILTERING ---
function renderIpamTable() {
    const searchVal = ipamSearch.value.toLowerCase();
    const areaFilter = ipamFilterArea.value;

    ipamTbody.innerHTML = "";

    const filtered = IPAM_REGISTRY.filter(row => {
        // Search text check
        const matchText = row.vlan.toLowerCase().includes(searchVal) || 
                          row.desc.toLowerCase().includes(searchVal) || 
                          row.cidr.toLowerCase().includes(searchVal) || 
                          row.range.toLowerCase().includes(searchVal);
        
        // Area check
        const matchArea = areaFilter === "all" || row.area === areaFilter;

        return matchText && matchArea;
    });

    if (filtered.length === 0) {
        ipamTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">No matching subnets found.</td></tr>`;
        return;
    }

    filtered.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight: 600; color: var(--color-primary);">${row.vlan}</td>
            <td>${row.desc}</td>
            <td style="font-family: var(--font-mono); font-weight: 600;">${row.cidr}</td>
            <td style="font-family: var(--font-mono);">${row.mask}</td>
            <td style="font-family: var(--font-mono); color: #cbd5e1;">${row.range}</td>
            <td style="font-family: var(--font-mono); color: var(--text-muted);">${row.broadcast}</td>
            <td><span class="area-badge area-${row.area}">OSPF Area ${row.area}</span></td>
        `;
        ipamTbody.appendChild(tr);
    });
}

// --- 11. TRAFFIC FLOW SIMULATOR ---
function clearSimulations() {
    document.querySelectorAll(".link").forEach(l => {
        l.classList.remove("active");
        l.classList.remove("cut");
    });
    
    simIntervals.forEach(clearInterval);
    simIntervals = [];
    
    document.querySelectorAll(".packet").forEach(p => p.remove());
    
    if (DEVICES["CORE-SW-A"]) {
        DEVICES["CORE-SW-A"].ports[0].status = "up";
    }
    
    activeSim = null;
    btnStopSim.disabled = true;
    simCards.forEach(c => c.classList.remove("active"));
}

function startSimulation(simType) {
    clearSimulations();
    activeSim = simType;
    btnStopSim.disabled = false;
    
    const card = document.querySelector(`.sim-card[data-sim="${simType}"]`);
    if (card) card.classList.add("active");

    switch(simType) {
        case "faculty":
            runFacultySimulation();
            break;
        case "student-p2p":
            runStudentP2PSimulation();
            break;
        case "failover":
            runFailoverSimulation();
            break;
        case "pvlan":
            runPVLANSimulation();
            break;
    }
}

function animatePacket(pathPoints, packetClass = "packet", speedFactor = 1) {
    if (pathPoints.length < 2) return;
    
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("r", 4.5);
    dot.setAttribute("class", `packet ${packetClass}`);
    svgCanvas.appendChild(dot);

    let segmentIdx = 0;
    let startPoint = NODES[pathPoints[0]];
    let endPoint = NODES[pathPoints[1]];
    let progress = 0;
    
    const duration = 1500 / speedFactor; // speed of traversal
    const segDuration = duration / (pathPoints.length - 1);
    let lastTime = performance.now();

    function step(timestamp) {
        if (!activeSim) {
            dot.remove();
            return;
        }
        
        const delta = timestamp - lastTime;
        lastTime = timestamp;
        progress += delta / segDuration;

        if (progress >= 1) {
            segmentIdx++;
            if (segmentIdx >= pathPoints.length - 1) {
                dot.remove();
                return;
            }
            startPoint = NODES[pathPoints[segmentIdx]];
            endPoint = NODES[pathPoints[segmentIdx + 1]];
            progress = 0;
        }

        const cx = startPoint.x + (endPoint.x - startPoint.x) * progress;
        const cy = startPoint.y + (endPoint.y - startPoint.y) * progress;
        
        dot.setAttribute("cx", cx);
        dot.setAttribute("cy", cy);
        
        requestAnimationFrame(step);
    }
    
    requestAnimationFrame(step);
}

// Simulation A: Faculty query (High Priority)
function runFacultySimulation() {
    const link1 = document.getElementById("link-ACAD-1-PC-1");
    const link2 = document.getElementById("link-ACAD-DIST-ACAD-1");
    const link3 = document.getElementById("link-CORE-SW-A-ACAD-DIST");
    const link4 = document.getElementById("link-EDGE-A-CORE-SW-A");
    const link5 = document.getElementById("link-ISP-A-EDGE-A");
    
    [link1, link2, link3, link4, link5].forEach(l => { if (l) l.classList.add("active"); });

    const path = ["PC-1", "ACAD-1", "ACAD-DIST", "CORE-SW-A", "EDGE-A", "ISP-A"];
    
    const interval = setInterval(() => {
        animatePacket(path, "faculty", 1.25);
    }, 450);
    simIntervals.push(interval);
}

// Simulation B: Student P2P congestion showing WRED random drops
function runStudentP2PSimulation() {
    const linkF1 = document.getElementById("link-ACAD-1-PC-1");
    const linkF2 = document.getElementById("link-ACAD-DIST-ACAD-1");
    const linkF3 = document.getElementById("link-CORE-SW-A-ACAD-DIST");
    const linkF4 = document.getElementById("link-EDGE-A-CORE-SW-A");
    const linkF5 = document.getElementById("link-ISP-A-EDGE-A");
    
    const linkS1 = document.getElementById("link-HOSTEL-1-Stud-Laptop");
    const linkS2 = document.getElementById("link-HOSTEL-DIST-HOSTEL-1");
    const linkS3 = document.getElementById("link-CORE-SW-B-HOSTEL-DIST");
    const linkS4 = document.getElementById("link-EDGE-B-CORE-SW-B");
    const linkS5 = document.getElementById("link-ISP-B-EDGE-B");
    
    [linkF1, linkF2, linkF3, linkF4, linkF5, linkS1, linkS2, linkS3, linkS4, linkS5].forEach(l => {
        if (l) l.classList.add("active");
    });

    const facultyPath = ["PC-1", "ACAD-1", "ACAD-DIST", "CORE-SW-A", "EDGE-A", "ISP-A"];
    const studentPath = ["Stud-Laptop", "HOSTEL-1", "HOSTEL-DIST", "CORE-SW-B", "EDGE-B", "ISP-B"];

    // Faculty traffic flows cleanly (Green packets)
    const intF = setInterval(() => {
        animatePacket(facultyPath, "faculty", 1.25);
    }, 450);

    // Student traffic is heavy, experiences WRED drops at CORE-SW-B (Amber packets)
    const intS = setInterval(() => {
        animatePacket(studentPath, "student", 0.95);
        
        // This flow gets dropped at CORE-SW-B to simulate congestion drops
        setTimeout(() => {
            if (!activeSim) return;
            const dropPath = ["Stud-Laptop", "HOSTEL-1", "HOSTEL-DIST", "CORE-SW-B"];
            animatePacket(dropPath, "student", 0.95);
            
            // Render red ring explosion at Core-B
            const cB = NODES["CORE-SW-B"];
            const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            ring.setAttribute("cx", cB.x);
            ring.setAttribute("cy", cB.y);
            ring.setAttribute("r", 5);
            ring.setAttribute("fill", "none");
            ring.setAttribute("stroke", "var(--color-red)");
            ring.setAttribute("stroke-width", "2");
            svgCanvas.appendChild(ring);
            
            let r = 5, op = 1;
            function fade() {
                if (!activeSim) { ring.remove(); return; }
                r += 0.8;
                op -= 0.05;
                ring.setAttribute("r", r);
                ring.setAttribute("opacity", op);
                if (op > 0) requestAnimationFrame(fade);
                else ring.remove();
            }
            fade();
        }, 225);
    }, 600);

    simIntervals.push(intF, intS);
}

// Simulation C: Fiber cut link failure & sub-second BFD reconvergence
function runFailoverSimulation() {
    const linkNormal1 = document.getElementById("link-ACAD-DIST-ACAD-1");
    const linkNormal2 = document.getElementById("link-CORE-SW-B-ACAD-DIST");
    const linkFailLink = document.getElementById("link-CORE-SW-A-ACAD-DIST");
    
    // Draw the failing link CORE-SW-A to ACAD-DIST as CUT (pulsing red)
    if (linkFailLink) linkFailLink.classList.add("cut");
    if (linkNormal1) linkNormal1.classList.add("active");
    if (linkNormal2) linkNormal2.classList.add("active");
    
    if (selectedNode === "CORE-SW-A") {
        const ports = document.querySelectorAll(".port-dot");
        if (ports.length > 0) {
            ports[0].className = "port-dot down";
            ports[0].parentNode.lastChild.textContent = " DOWN (10 Gbps)";
        }
    }
    if (DEVICES["CORE-SW-A"]) {
        DEVICES["CORE-SW-A"].ports[0].status = "down";
    }

    // Redirect route (Dynamic routing convergence path via Core-B)
    const reroutedPath = ["PC-1", "ACAD-1", "ACAD-DIST", "CORE-SW-B", "CORE-SW-A", "EDGE-A", "ISP-A"];
    
    const linkBackbone = document.getElementById("link-CORE-SW-A-CORE-SW-B");
    const linkCoreEdge = document.getElementById("link-EDGE-A-CORE-SW-A");
    const linkEdgeISP = document.getElementById("link-ISP-A-EDGE-A");
    [linkBackbone, linkCoreEdge, linkEdgeISP].forEach(l => { if (l) l.classList.add("active"); });

    const interval = setInterval(() => {
        animatePacket(reroutedPath, "faculty", 1.15);
    }, 450);

    simIntervals.push(interval);
}

// Simulation D: Hostel PVLAN Local Isolation Block
function runPVLANSimulation() {
    const linkHostelAccess = document.getElementById("link-HOSTEL-1-Stud-Laptop");
    if (linkHostelAccess) linkHostelAccess.classList.add("active");

    const host1 = NODES["HOSTEL-1"];
    const endpoint = NODES["Stud-Laptop"];

    // A student on BYOD endpoint attempts to send traffic to the access switch targeting another local node
    const int = setInterval(() => {
        const packet = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        packet.setAttribute("r", 4.5);
        packet.setAttribute("class", "packet student");
        packet.setAttribute("cx", endpoint.x);
        packet.setAttribute("cy", endpoint.y);
        svgCanvas.appendChild(packet);

        let progress = 0;
        let stage = 0; // 0: ascending to switch, 1: blocked/dropped
        
        function animateLocal() {
            if (!activeSim) { packet.remove(); return; }
            progress += 0.04;
            
            if (stage === 0) {
                // Rising up to the access switch
                const cx = endpoint.x + ((host1.x - endpoint.x) * progress);
                const cy = endpoint.y + ((host1.y - endpoint.y) * progress);
                packet.setAttribute("cx", cx);
                packet.setAttribute("cy", cy);
                
                if (progress >= 1) {
                    stage = 1;
                    progress = 0;
                    packet.setAttribute("class", "packet blocked");
                }
            } else {
                // Dropping: Packet fades out and falls back
                packet.setAttribute("opacity", 1 - progress);
                packet.setAttribute("cy", host1.y + (20 * progress));
                
                if (progress <= 0.05) {
                    const blockText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    blockText.setAttribute("x", host1.x);
                    blockText.setAttribute("y", host1.y - 14);
                    blockText.setAttribute("fill", "var(--color-red)");
                    blockText.setAttribute("font-size", "7.5px");
                    blockText.setAttribute("font-weight", "bold");
                    blockText.setAttribute("text-anchor", "middle");
                    blockText.textContent = "PVLAN ISOLATED";
                    svgCanvas.appendChild(blockText);
                    
                    setTimeout(() => blockText.remove(), 800);
                }
                
                if (progress >= 1) {
                    packet.remove();
                    return;
                }
            }
            requestAnimationFrame(animateLocal);
        }
        
        requestAnimationFrame(animateLocal);
    }, 850);

    simIntervals.push(int);
}

// --- 12. TAB SWITCHER (SPECS VS CONFIG) ---
function switchTab(e) {
    const tabName = e.target.getAttribute("data-tab");
    
    tabBtns.forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    
    tabPanes.forEach(pane => {
        pane.classList.remove("active");
        if (pane.id === `pane-${tabName}`) {
            pane.classList.add("active");
        }
    });
}

// --- 13. BOOTSTRAP INITIALIZATION ---
function init() {
    renderTopology();

    // Inspector close button
    btnCloseInspect.addEventListener("click", () => {
        document.querySelectorAll(".node-group").forEach(el => el.classList.remove("selected"));
        inspectorMain.classList.add("hide");
        inspectorPlaceholder.classList.remove("hide");
        selectedNode = null;
    });

    // Inspector specs vs config tabs
    tabBtns.forEach(btn => btn.addEventListener("click", switchTab));

    // View switcher tabs (Topology vs IPAM)
    viewTabBtns.forEach(btn => btn.addEventListener("click", switchView));

    // IPAM Search and Filter Event Listeners
    ipamSearch.addEventListener("input", renderIpamTable);
    ipamFilterArea.addEventListener("change", renderIpamTable);

    // Simulation triggers
    simCards.forEach(card => {
        card.addEventListener("click", () => {
            const sim = card.getAttribute("data-sim");
            startSimulation(sim);
        });
    });

    btnStopSim.addEventListener("click", clearSimulations);

    // Overlays toggles
    btnToggleOspf.addEventListener("click", () => {
        showOspfOverlay = !showOspfOverlay;
        btnToggleOspf.classList.toggle("active", showOspfOverlay);
        renderTopology(); // Redraw with backgrounds
    });
    
    btnToggleVlans.addEventListener("click", () => {
        showVlanOverlay = !showVlanOverlay;
        btnToggleVlans.classList.toggle("active", showVlanOverlay);
        renderTopology(); // Redraw with subnets
    });

    // Copy to clipboard CLI config
    btnCopyCode.addEventListener("click", () => {
        navigator.clipboard.writeText(inspectCode.textContent).then(() => {
            const oldText = btnCopyCode.textContent;
            btnCopyCode.textContent = "Copied!";
            btnCopyCode.style.borderColor = "var(--color-green)";
            btnCopyCode.style.color = "var(--color-green)";
            setTimeout(() => {
                btnCopyCode.textContent = oldText;
                btnCopyCode.style.borderColor = "";
                btnCopyCode.style.color = "";
            }, 1500);
        });
    });

    // Default Select CORE-SW-A on start
    selectDevice("CORE-SW-A");
}

window.addEventListener("DOMContentLoaded", init);
