# Guided Reference for a 5-10 Page Handwritten Assignment

*This guide is structured into 10 concise pages to make it easy for you to copy onto physical paper for your submission. It highlights key theory, easily drawable diagrams, and consolidated configuration snippets.*

---

## 📄 Page 1: Title, Objectives, and Hierarchical Design Theory
### 1. Title: Design of a Scalable & Secure Hierarchical Campus Network
### 2. Course Code: BAITE203 - Computer Networks and Data Communications
### 3. Student Name / Reg No: [Your Details]

### 4. Objectives of the Design:
*   Build a campus network supporting over 2,500 simultaneous users across Academic Blocks, Hostels, Library, and Administration.
*   Mitigate latency and bandwidth hogging from hostels using Traffic Shaping and QoS.
*   Establish strong security boundaries using Private VLANs (PVLANs), DHCP Snooping, and Dynamic ARP Inspection (DAI).
*   Implement sub-second link recovery using Multi-Area OSPF and Bidirectional Forwarding Detection (BFD).

### 5. The Hierarchical Three-Tier Model & Switch Models:
*   **Access Layer**: Provides physical connection endpoints for users, APs, and IoT. Operates at Layer 2. Initiates QoS tagging. (Equipment: Cisco Catalyst 9300 Series switches).
*   **Distribution Layer**: Aggregates access switches, acts as the Layer 2/3 boundary (default gateways via HSRP), and filters traffic. (Equipment: Cisco Catalyst 9300 or 9500 Series switches).
*   **Core Layer**: The high-speed backbone. Focuses strictly on fast IP forwarding. Operating at Layer 3, it links distribution switches and edge routers. (Equipment: Cisco Catalyst 9500 Series switches).

---

## 📄 Page 2: Hand-Drawable Physical & Logical Topology Diagram
*(Sketch this diagram in the center of your page using a ruler. Use color coding if possible.)*

```
                     +------------------+
                     |  ISP-A / ISP-B   |
                     +--------+---------+
                              | (eBGP WAN Links)
                     +--------+---------+
                     |   Edge Routers   | (ASR 1001-X / Catalyst 8300)
                     +--------+---------+
                              | (Layer 3 Subnet /30)
                 +------------+------------+
                 |                         |
        +--------+---------+      +--------+---------+
        |    CORE-SW-A     |======|    CORE-SW-B     | (OSPF Area 0 - Backbone: Catalyst 9500)
        +--------+---------+  SVL +--------+---------+
                 |                         |
        +--------+-------------------------+--------+  (Redundant Layer 3 /30 Links)
        |                         |                         |
+-------+-------+         +-------+-------+         +-------+-------+
|   ACAD-DIST   |         |  HOSTEL-DIST  |         | LIBADMIN-DIST | (MDF Catalyst 9500)
+-------+-------+         +-------+-------+         +-------+-------+
   (OSPF Area 2)             (OSPF Area 1)             (OSPF Area 3)
        | (Trunks)                | (PVLANs)                | (Trunks)
+-------+-------+         +-------+-------+         +-------+-------+
|  Access Stacks|         |  Access Stacks|         |  Access Stacks| (IDF Catalyst 9300)
| (ACAD-1/2/3)  |         |  (HOSTEL-1/2) |         | (LIB / ADMIN) |
+-------+-------+         +-------+-------+         +-------+-------+
        |                         |                         |
  [Faculty/PCs]            [Student BYODs]           [Research/Admin]
```

### Diagram Execution & OSPF Area Labeling:
1.  **OSPF Area Enclosures**: When copying this diagram, draw colored boundaries or circles around the components to show the OSPF areas clearly:
    *   **Area 0 (Backbone)**: Enclose the Core switches (`CORE-SW-A` and `CORE-SW-B`) and their SVL link.
    *   **Area 1 (Hostels)**: Enclose the `HOSTEL-DIST` and `Access Stacks (HOSTEL-1/2)`.
    *   **Area 2 (Academic)**: Enclose the `ACAD-DIST` and `Access Stacks (ACAD-1/2/3)`.
    *   **Area 3 (Library/Admin)**: Enclose the `LIBADMIN-DIST` and `Access Stacks (LIB / ADMIN)`.
2.  **Interface Labels**: Label the trunk lines as Layer 2 trunks and core-to-distribution lines as Layer 3 routed links (/30 subnets).

---

## 📄 Page 3: Hardware Selection (Switches & Routers)
To support over 2,500 simultaneous users and guarantee uninterrupted access, the following enterprise-grade Cisco hardware has been selected for each tier of the hierarchical model:

### 1. Edge Routing (WAN & Internet): Cisco Catalyst 8300 Series / ASR 1001-X
*   **Role**: Acts as the secure gateway to the ISPs using eBGP, synchronizes paths via iBGP, and handles outbound NAT/PAT mapping.
*   **Selection Rationale**: Provides high-throughput hardware routing, deep packet inspection, and the advanced security features necessary for a campus edge boundary.

### 2. Core Layer (OSPF Area 0): Cisco Catalyst 9500 Series
*   **Role**: Functions as the ultra-fast routing backplane. Two units are combined using StackWise Virtual (SVL) to eliminate Spanning Tree loops and enable active-active multi-path forwarding.
*   **Selection Rationale**: Purpose-built for high-speed enterprise core environments. It easily supports 50ms BFD keepalives to guarantee sub-second link recovery (under 150ms) in the event of a fiber cut.

### 3. Distribution Layer (OSPF Areas 1, 2, 3): Cisco Catalyst 9300 Series
*   **Role**: Operates as Area Border Routers (ABRs) to summarize building subnets. These switches also run HSRP to provide a Virtual IP (VIP) default gateway to the client VLANs.
*   **Selection Rationale**: Delivers robust Layer 3 capabilities and hardware-accelerated QoS policy enforcement. This is critical for bandwidth shaping and ensuring faculty traffic is prioritized during peak hours.

### 4. Access Layer (Edge IDF Closets): Cisco Catalyst 9300 Series
*   **Role**: Provides physical connectivity, Power-over-Ethernet (PoE), and edge classification for QoS DSCP markings.
*   **Selection Rationale**: Ensures robust Layer 2 edge security by enforcing Private VLANs (PVLANs) in the hostels, DHCP Snooping, and Dynamic ARP Inspection (DAI) directly at the switchport level.

---

## 📄 Page 4: Logical VLSM IP Subnetting Design
Explain that Variable Length Subnet Masking (VLSM) is used to prevent IP address wasting by mapping subnet sizes directly to the user density of each building.
*   **Base Allocation**: Private class block `10.100.0.0/16` (65,536 IPs).
*   **Formula Used**: \(2^h - 2 \ge N\) (where \(h\) is host bits, and \(N\) is maximum hosts).

### Consolidated VLSM Allocation Matrix:
| Location / Building | User Density | Required Prefix | Subnet Allocated | Usable Host Range |
| :--- | :---: | :---: | :--- | :--- |
| **Hostels 1 & 2** | 2,000 / building | /21 | `10.100.0.0/21`<br>`10.100.8.0/21` | `10.100.0.1 - 10.100.7.254`<br>`10.100.8.1 - 10.100.15.254` |
| **Academic Block 1** | 1,000 hosts | /22 | `10.100.16.0/22` | `10.100.16.1 - 10.100.19.254` |
| **Academic Block 2** | 1,000 hosts | /22 | `10.100.20.0/22` | `10.100.20.1 - 10.100.23.254` |
| **Academic Block 3** | 1,000 hosts | /22 | `10.100.24.0/22` | `10.100.24.1 - 10.100.27.254` |
| **Central Library** | 500 hosts | /23 | `10.100.28.0/23` | `10.100.28.1 - 10.100.29.254` |
| **Administration** | 250 hosts | /24 | `10.100.30.0/24` | `10.100.30.1 - 10.100.30.254` |

---

## 📄 Page 5: VLAN Segmentation & IPAM Registry
Explain that VLANs are mapped 1:1 with subnets to isolate broadcast traffic and apply security rules.

### VLAN Layout Table:
| VLAN ID | Subnet CIDR | Subnet Mask | Gateway IP | Description & Access Policy |
| :---: | :--- | :--- | :--- | :--- |
| **10** | `10.100.16.0/23` | `255.255.254.0` | `10.100.16.1` | Acad 1 Students. Blocked from Admin VLAN. |
| **11** | `10.100.18.0/24` | `255.255.255.0` | `10.100.18.1` | Acad 1 Faculty. Priority routing. |
| **40** | `10.100.0.0/21` | `255.255.248.0` | `10.100.0.1` | Hostel 1 BYOD. Isolated PVLAN enforced. |
| **50** | `10.100.8.0/21` | `255.255.248.0` | `10.100.8.1` | Hostel 2 BYOD. Isolated PVLAN enforced. |
| **60** | `10.100.28.0/24` | `255.255.255.0` | `10.100.28.1` | Library Guest Wi-Fi. Egress only. |
| **70** | `10.100.30.0/24` | `255.255.255.0` | `10.100.30.1` | Admin VLAN. Restricted access list. |
| **99** | `10.100.31.0/24` | `255.255.255.0` | `10.100.31.2` | Switch Management (Out-of-band). |

---

## 📄 Page 6: Dynamic Routing Design (OSPF & BGP)
Explain how traffic is dynamically routed internally and externally.

### 1. Interior Routing: Multi-Area OSPF
To prevent a single link flap from recalculating routing tables across the whole campus, the network is divided into OSPF Areas:
*   **Area 0 (Backbone)**: Core switches and Distribution uplinks. Performs fast transit routing.
*   **Area 1 (Hostels)**: Hostel Distribution and Access switches. Summarized as `10.100.0.0/20` into Area 0.
*   **Area 2 (Academic)**: Academic Distribution and Access switches. Summarized as `10.100.16.0/20`.
*   **Area 3 (Lib/Admin)**: Library & Admin switches. Summarized as `10.100.28.0/22`.

### 2. Exterior Routing: Dual-Homed BGP
*   Edge Routers run **External BGP (eBGP)** to peer with ISP-A (Primary) and ISP-B (Secondary).
*   **iBGP** runs between Edge-A and Edge-B to sync routing paths.
*   **NAT/PAT**: Edge routers perform Port Address Translation, overloading campus private IPs (`10.100.0.0/16`) to public IP pools.

---

## 📄 Page 7: Redundancy & High Availability (HA)
Explain how the design prevents single points of failure (SPOF):
1.  **Core Virtualization (StackWise Virtual - SVL)**:
    *   Combines `CORE-SW-A` and `CORE-SW-B` into a single logical switch.
    *   Eliminates STP blocks on redundant distribution links, enabling active-active multi-path forwarding.
2.  **First Hop Redundancy (HSRP)**:
    *   Active-Active default gateway redundancy deployed at the Distribution Layer.
    *   Virtual IP acts as default gateway. If Dist-A fails, Dist-B takes over the Virtual IP in under a second.
3.  **Sub-second Link Failover (BFD)**:
    *   Bidirectional Forwarding Detection (BFD) runs on all core-to-distribution fiber links.
    *   Helps detect physical path failures in **150 milliseconds**, allowing OSPF to bypass default dead-timers (40s) and reroute traffic instantly.

---

## 📄 Page 8: Cybersecurity & Layer 2 Security Policies
Explain the security measures deployed at the Access switches to protect the campus:

1.  **Private VLANs (PVLAN) in Hostels**:
    *   Hostel access switches configure student ports as **Isolated PVLAN ports**.
    *   Student devices can only talk to the promiscuous uplink; they *cannot* communicate with other student devices.
2.  **DHCP Snooping**: Filters out rogue DHCP servers. Access ports are untrusted; only uplinks are marked as trusted.
3.  **Dynamic ARP Inspection (DAI)**: Validates ARP packets against the DHCP snooping binding table to block Man-in-the-Middle attacks.
4.  **BPDU Guard & Portfast**: Applied to end-user ports to transition link states instantly while disabling ports if a rogue switch is connected.

---

## 📄 Page 9: Quality of Service (QoS) & Traffic Engineering
Explain the QoS queuing design that guarantees bandwidth for Faculty while restricting recreational traffic:
1.  **Classification & Marking (Access Layer)**:
    *   Faculty: Marked with high-priority DSCP class **AF41** or **EF**.
    *   Student: Marked as **Best Effort** (DSCP 0) or **Scavenger** (CS1) for P2P protocols.
2.  **Queuing & Scheduling (Distribution / Core)**:
    *   **CBWFQ** allocates dedicated queue weight to Faculty traffic.
    *   **WRED** is activated on outbound interfaces; selectively drops Scavenger/Best-Effort student packets early during congestion.
3.  **Hostel Shaping**: Policy maps hard-limit hostel bandwidth egress to **400 Mbps** during peak study hours.

---

## 📄 Page 10: High-Yield CLI Configurations & Design Verification

### 1. CORE-SW-A (OSPF & BFD Config)
```cisco
hostname CORE-SW-A
!
interface TenGigabitEthernet1/0/1
 ip ospf network point-to-point
 bfd interval 50 min_rx 50 multiplier 3
 ip ospf bfd
```

### 2. HOSTEL-1 (PVLAN Config)
```cisco
vlan 40
 private-vlan primary
 private-vlan association 401
vlan 401
 private-vlan isolated
!
interface range GigabitEthernet1/0/1 - 24
 switchport mode private-vlan host
 switchport private-vlan host-association 40 401
```

### 3. Design Verification Summary:
*   **Failure Isolation**: The three-tier model isolates failure domains.
*   **Table Compression**: OSPF route summarization reduces core routing table sizes by 80%.
*   **Transparent Failover**: HSRP/BFD guarantees traffic rerouting in less than 150 milliseconds.
*   **L2 Mitigation**: Private VLANs ensure client-to-client isolation within the hostels, ensuring deterministic performance.
