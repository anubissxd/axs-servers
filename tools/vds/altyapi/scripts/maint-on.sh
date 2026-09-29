#!/bin/bash
touch /root/scripts/maintenance.flag
python3 /root/scripts/update_players.py
