# Production Network Automation & Verification Suite

This directory contains the Python-based network orchestration engine and post-deployment compliance validator for the university campus network deployment.

---

## Directory Structure

```
automation/
├── configs/                # Individual Cisco configuration payloads
│   ├── CORE-SW-A.cfg
│   ├── CORE-SW-B.cfg
│   ├── ACAD-DIST.cfg
│   ├── HOSTEL-DIST.cfg
│   ├── LIBADMIN-DIST.cfg
│   ├── EDGE-A.cfg
│   ├── EDGE-B.cfg
│   ├── ACAD-1.cfg
│   └── HOSTEL-1.cfg
├── inventory.yaml          # Network inventory registry (IPs, credentials, roles)
├── deploy.py               # Concurrent Netmiko-based SSH config deployer
├── validate.py             # Post-deployment verification & diagnostics engine
└── requirements.txt        # Python library dependencies
```

---

## Installation & Prerequisites

To execute the deployment and verification engine, Python 3.8+ must be installed along with the required libraries.

1. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

2. Make sure you have SSH access and matching credentials set up on your target Cisco switches and routers (virtualized in GNS3, EVE-NG, or physical).

3. Edit `inventory.yaml` to specify your devices' actual management IP addresses, connection credentials, and enable secrets.

---

## 🚀 1. Automated Configuration Deployment (`deploy.py`)

The configuration deployer logs into all devices in the registry concurrently via SSH using thread pooling. It switches into privilege execute mode, pushes the configuration commands line-by-line, and saves the configuration (`write memory` / `copy running-config startup-config`) to NVRAM.

### How to Run:
```bash
python deploy.py
```

### Execution Behavior:
*   Launches up to 5 concurrent threads to speed up multi-node deployments.
*   Authenticates via SSH using the credentials in `inventory.yaml`.
*   Applies configuration commands from `configs/<device-name>.cfg`.
*   Saves configurations and prints a detailed execution summary report (showing success/failure status and reason).

---

## 🔍 2. Automated Diagnostics & Compliance Verification (`validate.py`)

The validator connects to each switch/router and runs specific diagnostics based on the node's architectural role, checking for protocol status and security configurations.

### Verification Matrix by Device Role:
*   **Core Layer**:
    *   OSPF Neighbor Adjacencies (`show ip ospf neighbor`)
    *   Interface line states (`show ip interface brief`)
    *   BFD Neighbors active (`show bfd neighbors`)
    *   Inter-VLAN ping sweeps across all gateway subnets
*   **Distribution Layer**:
    *   HSRP active/standby gateway status (`show standby brief`)
    *   OSPF Area range routing summary (`show ip route summary`)
*   **Access Layer**:
    *   DHCP Snooping binding database (`show ip dhcp snooping binding`)
    *   Dynamic ARP Inspection statistics (`show ip arp inspection statistics`)
    *   Port Security violation counters (`show port-security`)
*   **Internet Edge**:
    *   eBGP peering session states (`show ip bgp summary`)
    *   NAT/PAT translation entries (`show ip nat translations`)

### How to Run:
```bash
python validate.py
```

### Output:
Generates a detailed audit log and reports file: **`verification_report.txt`** in the main directory. This report contains the output of every diagnostic check and highlights if any device is unreachable or has failed any dynamic routing/security check.
