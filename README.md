# 🌐 Campus Core — Interactive Network Topology Visualizer & Simulator

A high-performance interactive campus network simulator and enterprise network architecture supporting **2,500+ simultaneous users** across a three-tier hierarchical infrastructure.

🔗 **Live Deployment:** [https://cn-case-study.vercel.app](https://cn-case-study.vercel.app)

---

## 🚀 Key Features

* **Interactive Topology Map**: Visual SVG canvas rendering real-time nodes across Core, Distribution, and Access tiers with active link status indicators.
* **Multi-Area OSPF Visualizer**: Dynamic overlay highlighting OSPF Area 0 (Backbone), Area 1 (Hostels), Area 2 (Academic Blocks), and Area 3 (Library & Administration).
* **IPAM Subnet Explorer**: Searchable and filterable IP Address Management registry for all VLANs (`10.100.0.0/16` VLSM).
* **Live Traffic Simulations**:
  * **Faculty Database Query**: High-priority research traffic (DSCP AF41/EF) routing with guaranteed bandwidth.
  * **Hostel Congestion & QoS**: Heavy P2P traffic demonstrating CBWFQ scheduling and WRED queue management.
  * **OSPF & BFD Link Failover**: Sub-second path rerouting (<150ms) upon simulated fiber link cuts.
  * **Hostel Isolation (PVLAN)**: Layer 2 Private VLAN blocking horizontal east-west malware scans.
* **Device Inspector & CLI Console**: Live hardware parameter inspection (Catalyst 9500, 9300, ASR 1001-X) with production Cisco IOS CLI configuration viewer.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, CSS3, Vanilla JavaScript (SVG manipulation, event-driven simulation engine)
* **Deployment**: Vercel Static Hosting
* **Automation**: Python, Cisco IOS configuration templates (`automation/`)

---

## 📁 Repository Structure

```text
├── automation/          # Python automation scripts & Cisco config templates
├── css/                 # Modern responsive styling
├── js/                  # Interactive simulation engine & IPAM dataset
├── index.html           # Main application entry point
├── package.json         # Project manifest
├── server.js            # Local development server
├── vercel.json          # Vercel routing configuration
└── README.md            # Project documentation
```

---

## 🧑‍💻 Author
* **Ansh Katiyar** (`25BIT0333`)
* School of Computer Science Engineering and Information Systems (SCOPE)
* Vellore Institute of Technology (VIT)
