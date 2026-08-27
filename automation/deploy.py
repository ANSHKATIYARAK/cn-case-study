#!/usr/bin/env python3
"""
Orchestration Engine: Concurrent Cisco IOS Configuration Deployer
Pushes designed configs concurrently to switches and routers.
"""

import os
import sys
import yaml
from concurrent.futures import ThreadPoolExecutor, as_completed
from netmiko import ConnectHandler
from netmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException

# Load Inventory Registry
def load_inventory(inventory_path="inventory.yaml"):
    if not os.path.exists(inventory_path):
        print(f"[ERROR] Inventory file not found at: {inventory_path}")
        sys.exit(1)
    with open(inventory_path, 'r') as f:
        return yaml.safe_load(f)

# Connect and deploy configuration to a single device
def deploy_config_to_device(device_info):
    hostname = device_info['hostname']
    ip = device_info['ip']
    config_file = device_info.get('config_file')
    
    print(f"[{hostname}] Initializing deployment to {ip}...")
    
    # Read configuration commands from file
    if not config_file or not os.path.exists(config_file):
        # Fallback to local configs directory if config_file path is relative
        fallback_path = os.path.join(os.path.dirname(__file__), config_file)
        if not os.path.exists(fallback_path):
            return {
                "hostname": hostname,
                "status": "FAILED",
                "message": f"Configuration file not found: {config_file}"
            }
        config_file = fallback_path

    try:
        with open(config_file, 'r') as f:
            # Netmiko send_config_set accepts list of commands or file path
            config_commands = f.read().splitlines()
    except Exception as e:
        return {
            "hostname": hostname,
            "status": "FAILED",
            "message": f"Error reading config file: {str(e)}"
        }

    # Connection Profile
    connection_profile = {
        'device_type': device_info['device_type'],
        'host': ip,
        'username': device_info['username'],
        'password': device_info['password'],
        'secret': device_info['secret'],
        'timeout': 15,
        'fast_cli': True
    }

    try:
        # Establish SSH Connection
        net_connect = ConnectHandler(**connection_profile)
        net_connect.enable()
        
        print(f"[{hostname}] Connection established. Pushing configuration...")
        
        # Deploy config commands
        output = net_connect.send_config_set(config_commands)
        
        print(f"[{hostname}] Configuration applied. Saving to NVRAM...")
        
        # Save running configuration to startup
        save_output = net_connect.save_config()
        
        net_connect.disconnect()
        return {
            "hostname": hostname,
            "status": "SUCCESS",
            "message": "Configuration successfully pushed and saved to NVRAM."
        }

    except NetmikoTimeoutException:
        return {
            "hostname": hostname,
            "status": "FAILED",
            "message": "Connection timed out. Check routing, cabling, and firewall access."
        }
    except NetmikoAuthenticationException:
        return {
            "hostname": hostname,
            "status": "FAILED",
            "message": "Authentication failed. Validate username, password, or SSH keys."
        }
    except Exception as e:
        return {
            "hostname": hostname,
            "status": "FAILED",
            "message": f"Deployment failed: {str(e)}"
        }

def main():
    inventory = load_inventory()
    devices = inventory.get('devices', [])
    
    if not devices:
        print("[WARN] No devices found in inventory registry.")
        sys.exit(0)

    print(f"[START] Starting concurrent deployment to {len(devices)} devices...")
    
    results = []
    # Deploy concurrently using ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(deploy_config_to_device, dev): dev for dev in devices}
        
        for future in as_completed(futures):
            dev = futures[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                results.append({
                    "hostname": dev['hostname'],
                    "status": "FAILED",
                    "message": f"Executor thread raised exception: {str(e)}"
                })

    # Display Deployment Summary Report
    print("\n" + "="*50)
    print("DEPLOYMENT REPORT SUMMARY")
    print("="*50)
    
    success_count = 0
    failed_count = 0
    
    for res in results:
        status_marker = "✓" if res['status'] == "SUCCESS" else "✗"
        print(f"[{status_marker}] {res['hostname']}: {res['status']}")
        if res['status'] == "FAILED":
            print(f"    Reason: {res['message']}")
            failed_count += 1
        else:
            success_count += 1
            
    print("="*50)
    print(f"Total Completed: {len(devices)} | Success: {success_count} | Failed: {failed_count}")
    print("="*50)

if __name__ == "__main__":
    main()
