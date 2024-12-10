#!/usr/bin/env bash

# This installer uses basic ANSI escape codes for colors and does not rely on external tools like dialog.
# Make sure your terminal supports ANSI colors.

# ANSI Color Codes
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

LOGO='   ##---##                ##---#         
  #--------.#          #.--------#       
  .++++++---##-------###----+++++#       
 #.++---#+#---------------#++--+-.#      
 #.---#--...-----------------#---.#      
 #.+#----+++-------------------#-.#.#    
 #------------------------------#.#...#  
  ----++++++++++----+++++++++----#.....# 
 #--+#..........#++#.........-+---#..... 
#--+.....###.............#.....+--#-.#.-#
#-+......###...........####.....+---.+--#
#-....##........###........##....+-#----#
#-.....+.......#.#.........--.....------#
#-................................#----- 
 #................................#----# 
  ...............................#----#  
   .............................#---#    
    #..........................#--##     
      #......................#-##        
        ##................#
        
'

clear
echo -e "${CYAN}${LOGO}${RESET}"
echo -e "${BOLD}${CYAN}Kanban Board Installer${RESET}"
echo -e "This script will help you create a .env file with the required configuration."
echo

# Prompt for PRIVATE_TOKEN
echo -en "${BOLD}Please enter your PRIVATE_TOKEN:${RESET} "
read -r PRIVATE_TOKEN

# Prompt for GIT_URL
echo -en "${BOLD}Please enter your GIT_URL (e.g. https://git.latido.at):${RESET} "
read -r GIT_URL

# Write the .env file
cat > .env <<EOF
PRIVATE_TOKEN=$PRIVATE_TOKEN
GIT_URL=$GIT_URL
EOF

echo
echo -e "${GREEN}Your .env file has been created successfully!${RESET}"
echo

echo 
echo -e "${BOLD}Please run the following command to start the application:${RESET}"
echo -e "${CYAN}docker-compose up -d${RESET}"
echo

