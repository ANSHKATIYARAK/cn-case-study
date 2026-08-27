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
            { name: "TenGig1/0/1", status: "up", speed: "10 Gbps", desc: "Transit to ACAD-DIST-A" },
            { name: "TenGig1/0/2", status: "up", speed: "10 Gbps", desc: "Transit to HOSTEL-DIST-A" },
            { name: "TenGig1/0/3", status: "up", speed: "10 Gbps", desc: "Transit to LIBADMIN-DIST-A" },
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
            { name: "TenGig1/0/1", status: "up", speed: "10 Gbps", desc: "Transit to ACAD-DIST-B" },
            { name: "TenGig1/0/2", status: "up", speed: "10 Gbps", desc: "Transit to HOSTEL-DIST-B" },
            { name: "TenGig1/0/3", status: "up", speed: "10 Gbps", desc: "Transit to LIBADMIN-DIST-B" },
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
        config: `! ACAD-DIST-A GLOBAL CONFIGURATION
hostname ACAD-DIST-A
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
  ! Shape to 400 Mbps during peak academic hours (configured via cron / EEM)
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
            { name: "Gigabit0/0/0", status: "up", speed: "1 Gbps", desc: "Link to ISP-A (Primary)" },
            { name: "Gigabit0/0/1", status: "up", speed: "1 Gbps", desc: "Transit to CORE-SW-A" },
            { name: "Gigabit0/0/2", status: "up", speed: "1 Gbps", desc: "iBGP Sync Link to EDGE-B" }
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
            { name: "Gigabit0/0/0", status: "up", speed: "1 Gbps", desc: "Link to ISP-B (Secondary)" },
            { name: "Gigabit0/0/1", status: "up", speed: "1 Gbps", desc: "Transit to CORE-SW-B" },
            { name: "Gigabit0/0/2", status: "up", speed: "1 Gbps", desc: "iBGP Sync Link to EDGE-A" }
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
 set local-preference 100  ! Lower preference - secondary backup/hostel overflow
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
! Global DHCP Snooping & DAI
ip dhcp snooping
ip dhcp snooping vlan 10,11,12,99
no ip dhcp snooping information option
ip arp inspection vlan 10,11,12,99
!
! Configure Client Ports (Edge Ports)
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
! Configure Faculty Ports
interface range GigabitEthernet1/0/41 - 44
 switchport mode access
 switchport access vlan 11
 spanning-tree portfast
 spanning-tree bpduguard enable
 exit
!
! Configure UPOE/mGig Port for Wi-Fi 6 Access Point
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
! Uplink to Distribution Switch (802.1Q Trunk)
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
            { name: "Gig1/0/2", status: "up", speed: "1 Gbps", desc: "Student BYOD Room 102" },
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
! Student BYOD Client Ports (Isolated PVLAN ports)
interface range GigabitEthernet1/0/1 - 44
 description Student BYOD Ports (Isolated)
 switchport mode private-vlan host
 switchport private-vlan host-association 40 401
 spanning-tree portfast
 spanning-tree bpduguard enable
 ip dhcp snooping limit rate 50
 exit
!
! Switch Management IP
interface Vlan99
 ip address 10.100.31.20 255.255.255.0
 exit
ip default-gateway 10.100.31.2
!
! Promiscuous Uplink to HOSTEL-DIST-A
interface TenGigabitEthernet1/1/1
 description Promiscuous Uplink to HOSTEL-DIST
 switchport mode private-vlan promiscuous
 switchport private-vlan mapping 40 401
 exit`
    }
};

// Add remaining devices with boilerplate data for visualization
["ACAD-2", "ACAD-3", "HOSTEL-2", "LIBRARY", "ADMIN"].forEach(nodeName => {
    if (!DEVICES[nodeName]) {
        let isHostel = nodeName.startsWith("HOSTEL");
        let isLibAdmin = ["LIBRARY", "ADMIN"].includes(nodeName);
        let tierLabel = "Access Layer";
        let modelNo = "Cisco Catalyst 9300-48T";
        let specIp = isHostel ? "10.100.8.10/21" : (nodeName === "LIBRARY" ? "10.100.28.10/24" : "10.100.30.10/24");
        let vlanId = isHostel ? "50" : (nodeName === "LIBRARY" ? "60" : "70");
        let distNode = isHostel ? "HOSTEL-DIST" : (isLibAdmin ? "LIBADMIN-DIST" : "ACAD-DIST");
        
        DEVICES[nodeName] = {
            name: nodeName,
            tier: tierLabel,
            model: modelNo,
            ip: specIp,
            capacity: "176 Gbps (Standalone)",
            rate: "Up to 130 Mpps",
            ports: [
                { name: "Gig1/0/1", status: "up", speed: "1 Gbps", desc: "User Port" },
                { name: "Gig1/0/2", status: "up", speed: "1 Gbps", desc: "User Port" },
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

// --- 2. TOPOLOGY GRAPH NODES COORDINATES ---
const NODES = {
    // Edge (Tier 0)
    "ISP-A": { x: 350, y: 50, label: "ISP-A (Primary)", type: "cloud" },
    "ISP-B": { x: 650, y: 50, label: "ISP-B (Secondary)", type: "cloud" },
    "EDGE-A": { x: 350, y: 130, label: "EDGE-A (ASR1001-X)", type: "router" },
    "EDGE-B": { x: 650, y: 130, label: "EDGE-B (Cat 8300)", type: "router" },
    
    // Core (Tier 1)
    "CORE-SW-A": { x: 350, y: 220, label: "CORE-SW-A (Cat 9500)", type: "core" },
    "CORE-SW-B": { x: 650, y: 220, label: "CORE-SW-B (Cat 9500)", type: "core" },
    
    // Distribution (Tier 2)
    "ACAD-DIST": { x: 200, y: 350, label: "ACAD-DIST", type: "dist" },
    "HOSTEL-DIST": { x: 500, y: 350, label: "HOSTEL-DIST", type: "dist" },
    "LIBADMIN-DIST": { x: 800, y: 350, label: "LIBADMIN-DIST", type: "dist" },
    
    // Access (Tier 3)
    "ACAD-1": { x: 100, y: 480, label: "ACAD-1 (Block 1)", type: "access" },
    "ACAD-2": { x: 200, y: 480, label: "ACAD-2 (Block 2)", type: "access" },
    "ACAD-3": { x: 300, y: 480, label: "ACAD-3 (Block 3)", type: "access" },
    
    "HOSTEL-1": { x: 450, y: 480, label: "HOSTEL-1", type: "access" },
    "HOSTEL-2": { x: 550, y: 480, label: "HOSTEL-2", type: "access" },
    
    "LIBRARY": { x: 750, y: 480, label: "LIBRARY", type: "access" },
    "ADMIN": { x: 850, y: 480, label: "ADMIN", type: "access" }
};

const LINKS = [
    // WAN
    { src: "ISP-A", dest: "EDGE-A", area: 0 },
    { src: "ISP-B", dest: "EDGE-B", area: 0 },
    
    // Edge to Core
    { src: "EDGE-A", dest: "CORE-SW-A", area: 0 },
    { src: "EDGE-B", dest: "CORE-SW-B", area: 0 },
    { src: "EDGE-A", dest: "EDGE-B", area: 0 }, // iBGP link
    
    // Core SVL
    { src: "CORE-SW-A", dest: "CORE-SW-B", area: 0, type: "svl" },
    
    // Core to Dist
    { src: "CORE-SW-A", dest: "ACAD-DIST", area: 0 },
    { src: "CORE-SW-B", dest: "ACAD-DIST", area: 0 },
    { src: "CORE-SW-A", dest: "HOSTEL-DIST", area: 0 },
    { src: "CORE-SW-B", dest: "HOSTEL-DIST", area: 0 },
    { src: "CORE-SW-A", dest: "LIBADMIN-DIST", area: 0 },
    { src: "CORE-SW-B", dest: "LIBADMIN-DIST", area: 0 },
    
    // Dist to Access
    { src: "ACAD-DIST", dest: "ACAD-1", area: 2 },
    { src: "ACAD-DIST", dest: "ACAD-2", area: 2 },
    { src: "ACAD-DIST", dest: "ACAD-3", area: 2 },
    
    { src: "HOSTEL-DIST", dest: "HOSTEL-1", area: 1 },
    { src: "HOSTEL-DIST", dest: "HOSTEL-2", area: 1 },
    
    { src: "LIBADMIN-DIST", dest: "LIBRARY", area: 3 },
    { src: "LIBADMIN-DIST", dest: "ADMIN", area: 3 }
];

// OSPF Area Boundary Shapes (Polygons coordinates)
const OSPF_AREAS = [
    {
        id: "area0",
        points: "280,100 720,100 720,270 280,270",
        label: "OSPF Area 0 (Backbone)",
        color: "var(--area-0)"
    },
    {
        id: "area1",
        points: "380,310 620,310 620,540 380,540",
        label: "OSPF Area 1 (Hostels)",
        color: "var(--area-1)"
    },
    {
        id: "area2",
        points: "50,310 350,310 350,540 50,540",
        label: "OSPF Area 2 (Academic Blocks)",
        color: "var(--area-2)"
    },
    {
        id: "area3",
        points: "680,310 950,310 950,540 680,540",
        label: "OSPF Area 3 (Library & Administration)",
        color: "var(--area-3)"
    }
];

// --- 3. DOM SELECTION ---
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

// Tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

// Simulation Cards
const simCards = document.querySelectorAll(".sim-card");

// --- 4. CONFIG STATE VARIABLES ---
let selectedNode = null;
let activeSim = null;
let simIntervals = [];
let showOspfOverlay = false;
let showVlanOverlay = false;

// --- 5. INITIAL SVG TOPOLOGY DRAWING ---
function renderTopology() {
    svgCanvas.innerHTML = ""; // Clear canvas
    
    // Create filters and markers
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    // Cloud icon definition
    const cloudPath = "M25,15 C25,12.2 22.8,10 20,10 C19.6,10 19.3,10.1 18.9,10.2 C17.8,7.7 15.1,6 12,6 C7.6,6 4,9.6 4,14 C4,14.3 4.0,14.7 4.1,15 C1.7,16 0,18.3 0,21 C0,24.9 3.1,28 7,28 L24,28 C28.4,28 32,24.4 32,20 C32,16.5 29,15.6 25,15 Z";
    
    defs.innerHTML = `
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
    `;
    svgCanvas.appendChild(defs);

    // 1. Draw OSPF Area Boundary Shapes
    OSPF_AREAS.forEach(area => {
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", area.points);
        polygon.setAttribute("class", `area-outline ${area.id}`);
        polygon.setAttribute("fill", "transparent");
        polygon.setAttribute("stroke-width", "2");
        polygon.setAttribute("stroke", area.color);
        polygon.setAttribute("id", `poly-${area.id}`);
        
        // Label inside OSPF area
        const coords = area.points.split(" ")[0].split(",");
        const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        labelText.setAttribute("x", parseFloat(coords[0]) + 15);
        labelText.setAttribute("y", parseFloat(coords[1]) + 20);
        labelText.setAttribute("fill", area.color);
        labelText.setAttribute("font-size", "10px");
        labelText.setAttribute("font-weight", "bold");
        labelText.setAttribute("class", `area-outline ${area.id}`);
        labelText.textContent = area.label;
        
        svgCanvas.appendChild(polygon);
        svgCanvas.appendChild(labelText);
    });

    // 2. Draw Links
    LINKS.forEach((link, idx) => {
        const srcNode = NODES[link.src];
        const destNode = NODES[link.dest];
        if (!srcNode || !destNode) return;
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", srcNode.x);
        line.setAttribute("y1", srcNode.y);
        line.setAttribute("x2", destNode.x);
        line.setAttribute("y2", destNode.y);
        
        let linkClass = "link normal";
        if (link.type === "svl") {
            linkClass = "link normal svl-link";
            line.setAttribute("stroke-dasharray", "4 2");
        } else {
            linkClass = `link area${link.area}`;
        }
        
        line.setAttribute("class", linkClass);
        line.setAttribute("id", `link-${link.src}-${link.dest}`);
        
        // Add dynamic tooltip to links
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = `${link.src} ⟷ ${link.dest}`;
        line.appendChild(title);

        svgCanvas.appendChild(line);
    });

    // 3. Draw Nodes
    Object.keys(NODES).forEach(nodeKey => {
        const node = NODES[nodeKey];
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("class", "node-group");
        group.setAttribute("id", `node-${nodeKey}`);
        group.addEventListener("click", () => selectDevice(nodeKey));

        // Node Glow Ring (Glows when selected)
        const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        glow.setAttribute("cx", node.x);
        glow.setAttribute("cy", node.y);
        glow.setAttribute("r", 18);
        glow.setAttribute("class", "node-outer-glow");
        glow.setAttribute("stroke", "var(--color-primary)");
        glow.setAttribute("stroke-width", "3");
        group.appendChild(glow);

        // Node Shape
        let shape;
        if (node.type === "cloud") {
            shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
            shape.setAttribute("d", cloudPath);
            shape.setAttribute("transform", `translate(${node.x - 16}, ${node.y - 14}) scale(1.0)`);
            shape.setAttribute("fill", "#64748b");
            shape.setAttribute("class", "node-base");
        } else {
            shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            shape.setAttribute("cx", node.x);
            shape.setAttribute("cy", node.y);
            shape.setAttribute("r", 14);
            shape.setAttribute("class", "node-base");
            
            // Define colors by hardware tier
            let color = "#cbd5e1";
            if (node.type === "core") color = "var(--area-0)";
            else if (node.type === "dist") color = "var(--color-amber)";
            else if (node.type === "access") color = "var(--color-green)";
            else if (node.type === "router") color = "var(--color-red)";
            shape.setAttribute("fill", color);
        }
        group.appendChild(shape);

        // Device Icon Details inside circle
        if (node.type !== "cloud") {
            const innerSymbol = document.createElementNS("http://www.w3.org/2000/svg", "text");
            innerSymbol.setAttribute("x", node.x);
            innerSymbol.setAttribute("y", node.y + 4);
            innerSymbol.setAttribute("font-size", "11px");
            innerSymbol.setAttribute("fill", "#090d16");
            innerSymbol.setAttribute("text-anchor", "middle");
            innerSymbol.setAttribute("font-weight", "bold");
            
            if (node.type === "core") innerSymbol.textContent = "C";
            else if (node.type === "dist") innerSymbol.textContent = "D";
            else if (node.type === "access") innerSymbol.textContent = "A";
            else if (node.type === "router") innerSymbol.textContent = "R";
            
            group.appendChild(innerSymbol);
        }

        // Labels
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", node.x);
        label.setAttribute("y", node.y + 28);
        label.setAttribute("class", "node-label");
        label.textContent = nodeKey;
        group.appendChild(label);

        // Subtext / Desc
        const subtext = document.createElementNS("http://www.w3.org/2000/svg", "text");
        subtext.setAttribute("x", node.x);
        subtext.setAttribute("y", node.y + 38);
        subtext.setAttribute("class", "node-subtext");
        
        let desc = "";
        if (node.type === "cloud") desc = "WAN Gateway";
        else if (node.type === "core") desc = "Core SVL Node";
        else if (node.type === "dist") desc = "MDF Distribution";
        else if (node.type === "access") desc = "IDF Switch";
        else if (node.type === "router") desc = "Edge Routers";
        subtext.textContent = desc;
        group.appendChild(subtext);

        svgCanvas.appendChild(group);
    });
}

// --- 6. INTERACTION LOGIC (SELECT DEVICES) ---
function selectDevice(nodeKey) {
    // Update SVG selection state
    document.querySelectorAll(".node-group").forEach(el => el.classList.remove("selected"));
    const selectedGroup = document.getElementById(`node-${nodeKey}`);
    if (selectedGroup) {
        selectedGroup.classList.add("selected");
    }

    selectedNode = nodeKey;
    const data = DEVICES[nodeKey];
    if (!data) return;

    // Reveal Inspector
    inspectorPlaceholder.classList.add("hide");
    inspectorMain.classList.remove("hide");

    // Populates fields
    inspectName.textContent = data.name;
    inspectTier.textContent = data.tier;
    
    // Set color matching tier
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

    // Populate Ports
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

    // Populate Config code
    inspectCode.textContent = data.config;
}

// --- 7. OVERLAY SYSTEMS (OSPF & VLANS) ---
function toggleOspfOverlay() {
    showOspfOverlay = !showOspfOverlay;
    btnToggleOspf.classList.toggle("active", showOspfOverlay);
    document.querySelectorAll(".area-outline").forEach(el => {
        el.classList.toggle("active", showOspfOverlay);
    });
}

function toggleVlanOverlay() {
    showVlanOverlay = !showVlanOverlay;
    btnToggleVlans.classList.toggle("active", showVlanOverlay);
    
    // If VLAN overlay active, temporarily rewrite subtexts with Subnet IDs
    Object.keys(NODES).forEach(nodeKey => {
        const node = NODES[nodeKey];
        const group = document.getElementById(`node-${nodeKey}`);
        if (!group) return;
        const subtextEl = group.querySelector(".node-subtext");
        if (!subtextEl) return;
        
        if (showVlanOverlay) {
            const devData = DEVICES[nodeKey];
            if (devData) {
                // Shorten IP display for node subtexts
                subtextEl.textContent = devData.ip.split(" ")[0];
                subtextEl.setAttribute("fill", "var(--color-primary)");
            }
        } else {
            // Restore normal descriptions
            let desc = "";
            if (node.type === "cloud") desc = "WAN Gateway";
            else if (node.type === "core") desc = "Core SVL Node";
            else if (node.type === "dist") desc = "MDF Distribution";
            else if (node.type === "access") desc = "IDF Switch";
            else if (node.type === "router") desc = "Edge Routers";
            subtextEl.textContent = desc;
            subtextEl.setAttribute("fill", "var(--text-secondary)");
        }
    });
}

// --- 8. REAL-TIME TRAFFIC FLOW SIMULATOR ---
function clearSimulations() {
    // Clear links classes
    document.querySelectorAll(".link").forEach(l => {
        l.classList.remove("active");
        l.classList.remove("cut");
    });
    
    // Clear intervals
    simIntervals.forEach(clearInterval);
    simIntervals = [];
    
    // Clear running animated dots
    const packets = document.querySelectorAll(".packet");
    packets.forEach(p => p.remove());
    
    // Restore port lists if any was affected by cut
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

// Helper to spawn a packet dot and animate it along coordinates
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
    
    const duration = 1200 / speedFactor; // ms for entire path
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
                // Arrived at destination
                dot.remove();
                return;
            }
            startPoint = NODES[pathPoints[segmentIdx]];
            endPoint = NODES[pathPoints[segmentIdx + 1]];
            progress = 0;
        }

        // Interpolate position
        const cx = startPoint.x + (endPoint.x - startPoint.x) * progress;
        const cy = startPoint.y + (endPoint.y - startPoint.y) * progress;
        
        dot.setAttribute("cx", cx);
        dot.setAttribute("cy", cy);
        
        requestAnimationFrame(step);
    }
    
    requestAnimationFrame(step);
}

// --- SIMULATION RUNNERS ---

// Scenario A: Faculty Research Access
function runFacultySimulation() {
    // Active routes
    const link1 = document.getElementById("link-ACAD-DIST-ACAD-1");
    const link2 = document.getElementById("link-CORE-SW-A-ACAD-DIST");
    const link3 = document.getElementById("link-EDGE-A-CORE-SW-A");
    const link4 = document.getElementById("link-ISP-A-EDGE-A");
    
    [link1, link2, link3, link4].forEach(l => {
        if (l) l.classList.add("active");
    });

    const path = ["ACAD-1", "ACAD-DIST", "CORE-SW-A", "EDGE-A", "ISP-A"];
    
    // Spawn packets continually
    const interval = setInterval(() => {
        animatePacket(path, "faculty", 1.2);
    }, 400);
    
    simIntervals.push(interval);
}

// Scenario B: Student P2P congestion & QoS mitigation
function runStudentP2PSimulation() {
    // Highlight links
    const linkF1 = document.getElementById("link-ACAD-DIST-ACAD-1");
    const linkF2 = document.getElementById("link-CORE-SW-A-ACAD-DIST");
    const linkF3 = document.getElementById("link-EDGE-A-CORE-SW-A");
    const linkF4 = document.getElementById("link-ISP-A-EDGE-A");
    
    const linkS1 = document.getElementById("link-HOSTEL-DIST-HOSTEL-1");
    const linkS2 = document.getElementById("link-CORE-SW-B-HOSTEL-DIST");
    const linkS3 = document.getElementById("link-EDGE-B-CORE-SW-B");
    const linkS4 = document.getElementById("link-ISP-B-EDGE-B");
    
    [linkF1, linkF2, linkF3, linkF4, linkS1, linkS2, linkS3, linkS4].forEach(l => {
        if (l) l.classList.add("active");
    });

    const facultyPath = ["ACAD-1", "ACAD-DIST", "CORE-SW-A", "EDGE-A", "ISP-A"];
    const studentPath = ["HOSTEL-1", "HOSTEL-DIST", "CORE-SW-B", "EDGE-B", "ISP-B"];

    // Faculty traffic runs smoothly (High priority - green packets)
    const intF = setInterval(() => {
        animatePacket(facultyPath, "faculty", 1.2);
    }, 450);

    // Student traffic streams heavy (Best Effort / Scavenger - amber packets)
    // To demonstrate WRED congestion control: some student packets are randomly destroyed mid-flight!
    const intS = setInterval(() => {
        // Spawn 2 packet streams to simulate heavy load
        animatePacket(studentPath, "student", 0.9);
        
        // This packet represents a WRED drop scenario (drops mid-route)
        setTimeout(() => {
            if (!activeSim) return;
            const dropPath = ["HOSTEL-1", "HOSTEL-DIST", "CORE-SW-B"];
            animatePacket(dropPath, "student", 0.9);
            
            // Create a small red explosion/ring at Core-B to show drop
            const cB = NODES["CORE-SW-B"];
            const dropIndicator = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dropIndicator.setAttribute("cx", cB.x);
            dropIndicator.setAttribute("cy", cB.y);
            dropIndicator.setAttribute("r", 5);
            dropIndicator.setAttribute("fill", "none");
            dropIndicator.setAttribute("stroke", "var(--color-red)");
            dropIndicator.setAttribute("stroke-width", "2");
            svgCanvas.appendChild(dropIndicator);
            
            // Animate ring expansion and fade
            let r = 5;
            let op = 1;
            function fadeRing() {
                if (!activeSim) { dropIndicator.remove(); return; }
                r += 0.8;
                op -= 0.05;
                dropIndicator.setAttribute("r", r);
                dropIndicator.setAttribute("opacity", op);
                if (op > 0) requestAnimationFrame(fadeRing);
                else dropIndicator.remove();
            }
            fadeRing();
        }, 225);
    }, 500);

    simIntervals.push(intF, intS);
}

// Scenario C: OSPF and BFD Link Failover
function runFailoverSimulation() {
    // Show standard path links
    const linkNormal1 = document.getElementById("link-ACAD-DIST-ACAD-1");
    const linkNormal2 = document.getElementById("link-CORE-SW-B-ACAD-DIST");
    const linkFailLink = document.getElementById("link-CORE-SW-A-ACAD-DIST");
    
    // Draw the failure link CORE-SW-A to ACAD-DIST as CUT (pulsing red)
    if (linkFailLink) linkFailLink.classList.add("cut");
    if (linkNormal1) linkNormal1.classList.add("active");
    if (linkNormal2) linkNormal2.classList.add("active");
    
    // Adjust port status in Inspector if currently viewing CORE-SW-A
    if (selectedNode === "CORE-SW-A") {
        const ports = document.querySelectorAll(".port-dot");
        if (ports.length > 0) {
            ports[0].className = "port-dot down"; // Mark TenGig1/0/1 as down
            ports[0].parentNode.lastChild.textContent = " DOWN (10 Gbps)";
        }
    }
    if (DEVICES["CORE-SW-A"]) {
        DEVICES["CORE-SW-A"].ports[0].status = "down";
    }

    // Failover path (Rerouted through Core-B)
    const reroutedPath = ["ACAD-1", "ACAD-DIST", "CORE-SW-B", "CORE-SW-A", "EDGE-A", "ISP-A"];
    
    const linkBackbone = document.getElementById("link-CORE-SW-A-CORE-SW-B");
    const linkCoreEdge = document.getElementById("link-EDGE-A-CORE-SW-A");
    const linkEdgeISP = document.getElementById("link-ISP-A-EDGE-A");
    [linkBackbone, linkCoreEdge, linkEdgeISP].forEach(l => {
        if (l) l.classList.add("active");
    });

    // Spawn packets taking the rerouted OSPF path
    const interval = setInterval(() => {
        animatePacket(reroutedPath, "faculty", 1.1);
    }, 450);

    simIntervals.push(interval);
}

// Scenario D: Hostel Isolated PVLAN Protection
function runPVLANSimulation() {
    // Highlight local links inside Hostel 1
    const linkHostelAccess = document.getElementById("link-HOSTEL-DIST-HOSTEL-1");
    if (linkHostelAccess) linkHostelAccess.classList.add("active");

    const host1Loc = NODES["HOSTEL-1"];
    
    // We simulate a packet going from a client node in Hostel 1 to another client node.
    // The packet must rise up to the access switch (HOSTEL-1), but the switch immediately blocks it!
    const int = setInterval(() => {
        // Spawn packet starting slightly offset to represent Room 101 device
        const packet = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        packet.setAttribute("r", 4.5);
        packet.setAttribute("class", "packet student");
        packet.setAttribute("cx", host1Loc.x - 20);
        packet.setAttribute("cy", host1Loc.y + 50); // From below (rooms area)
        svgCanvas.appendChild(packet);

        let progress = 0;
        let stage = 0; // 0: ascending to switch, 1: blocked/dropped
        
        function animateLocal() {
            if (!activeSim) { packet.remove(); return; }
            progress += 0.04;
            
            if (stage === 0) {
                // Interpolate from Room 101 to Access Switch
                const cx = (host1Loc.x - 20) + (20 * progress);
                const cy = (host1Loc.y + 50) - (50 * progress);
                packet.setAttribute("cx", cx);
                packet.setAttribute("cy", cy);
                
                if (progress >= 1) {
                    stage = 1;
                    progress = 0;
                    // Change packet to Red to represent drop/block
                    packet.setAttribute("class", "packet blocked");
                }
            } else {
                // Drop: Packet fades out and falls down/disappears
                packet.setAttribute("opacity", 1 - progress);
                packet.setAttribute("cy", host1Loc.y + (20 * progress));
                
                // Show a brief "BLOCKED" label near the switch
                if (progress <= 0.05) {
                    const blockText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    blockText.setAttribute("x", host1Loc.x);
                    blockText.setAttribute("y", host1Loc.y - 12);
                    blockText.setAttribute("fill", "var(--color-red)");
                    blockText.setAttribute("font-size", "8px");
                    blockText.setAttribute("font-weight", "bold");
                    blockText.setAttribute("text-anchor", "middle");
                    blockText.textContent = "PVLAN BLOCKED";
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
    }, 900);

    simIntervals.push(int);
}

// --- 9. VIEW TAB CONTROLLER ---
function switchTab(e) {
    const tabName = e.target.getAttribute("data-tab");
    
    // Toggle active buttons
    tabBtns.forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
    
    // Toggle active panes
    tabPanes.forEach(pane => {
        pane.classList.remove("active");
        if (pane.id === `pane-${tabName}`) {
            pane.classList.add("active");
        }
    });
}

// --- 10. SETUP EVENT LISTENERS ---
function init() {
    renderTopology();

    // Node inspector close/placeholder behavior
    btnCloseInspect.addEventListener("click", () => {
        document.querySelectorAll(".node-group").forEach(el => el.classList.remove("selected"));
        inspectorMain.classList.add("hide");
        inspectorPlaceholder.classList.remove("hide");
        selectedNode = null;
    });

    // Tab buttons
    tabBtns.forEach(btn => btn.addEventListener("click", switchTab));

    // Simulation triggers
    simCards.forEach(card => {
        card.addEventListener("click", () => {
            const sim = card.getAttribute("data-sim");
            startSimulation(sim);
        });
    });

    // Stop Simulation
    btnStopSim.addEventListener("click", clearSimulations);

    // Overlays
    btnToggleOspf.addEventListener("click", toggleOspfOverlay);
    btnToggleVlans.addEventListener("click", toggleVlanOverlay);

    // Copy to clipboard
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

    // Default Select CORE-SW-A on load
    selectDevice("CORE-SW-A");
}

// Launch on page load
window.addEventListener("DOMContentLoaded", init);
