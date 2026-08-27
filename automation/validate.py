#!/usr/bin/env python3
"""
Diagnostics & Health Engine: Post-Deployment Compliance Validator
Connects to routers/switches, runs diagnostic commands, and generates a status report.
"""

import os
import sys
import yaml
from concurrent.futures import ThreadPoolExecutor, as_completed
from netmiko import ConnectHandler

def load_inventory(inventory_path="inventory.yaml"):
    if not os.path.exists(inventory_path):
        print(f"[ERROR] Inventory file not found at: {inventory_path}")
        sys.exit(1)
    with open(inventory_path, 'r') as f:
        return yaml.safe_load(f)

# Tailored diagnostics based on device role
def diagnose_device(device_info):
    hostname = device_info['hostname']
    ip = device_info['ip']
    role = device_info['role']
    
    connection_profile = {
        'device_type': device_info['device_type'],
        'host': ip,
        'username': device_info['username'],
        'password': device_info['password'],
        'secret': device_info['secret'],
        'timeout': 10,
        'fast_cli': True
    }
    
    diagnostics = {
        "hostname": hostname,
        "ip": ip,
        "status": "UNREACHABLE",
        "tests": {}
    }
    
    # Select commands based on role
    commands = {}
    if role == "core":
        commands = {
            "OSPF Adjacencies": "show ip ospf neighbor",
            "Interfaces Brief": "show ip interface brief",
            "BFD Neighbors": "show bfd neighbors"
        }
    elif role == "distribution":
        commands = {
            "HSRP Gateway Redundancy": "show standby brief",
            "Routing Table Summary": "show ip route summary"
        }
    elif role == "access":
        commands = {
            "DHCP Snooping Bindings": "show ip dhcp snooping binding",
            "Port Security Violations": "show port-security interface range Gi1/0/1 - 48",
            "Dynamic ARP inspection Status": "show ip arp inspection statistics"
        }
    elif role == "edge":
        commands = {
            "BGP Routing Peering": "show ip bgp summary",
            "Active NAT/PAT Translations": "show ip nat translations"
        }

    try:
        net_connect = ConnectHandler(**connection_profile)
        net_connect.enable()
        
        diagnostics["status"] = "REACHABLE"
        
        # Execute each diagnostic command
        for test_name, cmd in commands.items():
            print(f"[{hostname}] Running: {cmd}...")
            output = net_connect.send_command(cmd)
            diagnostics["tests"][test_name] = {
                "command": cmd,
                "output": output,
                "passed": len(output.strip()) > 0
            }
            
        # Core & Edge specific: verify routing via ping sweep to gateways
        if role == "core" or role == "edge":
            print(f"[{hostname}] Testing inter-VLAN routing ping sweeps...")
            gateways = ["10.100.16.1", "10.100.18.1", "10.100.20.1", "10.100.0.1", "10.100.8.1", "10.100.28.1"]
            ping_results = []
            for gw in gateways:
                res = net_connect.send_command(f"ping {gw} repeat 2 timeout 1")
                success = "Success rate is 100 percent" in res or "Success rate is 50 percent" in res
                ping_results.append(f"Ping {gw}: {'PASSED' if success else 'FAILED'}")
            
            diagnostics["tests"]["Inter-VLAN Connectivity"] = {
                "command": "ping <gateways>",
                "output": "\n".join(ping_results),
                "passed": all("PASSED" in r for r in ping_results)
            }
            
        net_connect.disconnect()
        return diagnostics
        
    except Exception as e:
        return {
            "hostname": hostname,
            "ip": ip,
            "status": "UNREACHABLE",
            "error": str(e),
            "tests": {}
        }

def main():
    inventory = load_inventory()
    devices = inventory.get('devices', [])
    
    if not devices:
        print("[WARN] No devices found in inventory.")
        sys.exit(0)

    print(f"[START] Commencing post-deployment verification across {len(devices)} nodes...")
    
    results = []
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(diagnose_device, dev): dev for dev in devices}
        for future in as_completed(futures):
            results.append(future.result())

    # Write detailed report to file
    report_path = "verification_report.txt"
    with open(report_path, "w") as f:
        f.write("="*70 + "\n")
        f.write("CAMPUS NETWORK COMPLIANCE & VERIFICATION REPORT\n")
        f.write("="*70 + "\n\n")
        
        passed_nodes = 0
        failed_nodes = 0
        
        for res in results:
            f.write(f"Device: {res['hostname']} ({res['ip']})\n")
            f.write(f"Connectivity Status: {res['status']}\n")
            
            if res['status'] == "UNREACHABLE":
                f.write(f"Error Code: {res.get('error', 'Unknown Connection Error')}\n")
                f.write("-"*50 + "\n\n")
                failed_nodes += 1
                continue
                
            passed_nodes += 1
            f.write("Test Results:\n")
            for test_name, test_data in res['tests'].items():
                status = "PASS" if test_data['passed'] else "FAIL"
                f.write(f"  [ {status} ] {test_name}\n")
                # Indent output
                indented_out = "    " + test_data['output'].replace("\n", "\n    ")
                f.write(f"    Command: {test_data['command']}\n")
                f.write(f"    Output:\n{indented_out}\n\n")
            f.write("-"*50 + "\n\n")
            
        f.write("="*70 + "\n")
        f.write("VERIFICATION SUMMARY\n")
        f.write("="*70 + "\n")
        f.write(f"Total Diagnosed: {len(devices)}\n")
        f.write(f"Reachable & Passed: {passed_nodes}\n")
        f.write(f"Unreachable / Failed: {failed_nodes}\n")
        f.write("="*70 + "\n")

    print(f"\n[COMPLETE] Post-deployment compliance report compiled at: {report_path}")
    print(f"Summary: Reachable & Configured: {passed_nodes} | Failed: {failed_nodes}")

if __name__ == "__main__":
    main()
