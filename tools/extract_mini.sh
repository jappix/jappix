#!/bin/bash
#
# Jappix - An open social platform
#
# This script extracts a PHP-independent version of
# Jappix Mini under the AGPL or the MPLv2.
#
# -------------------------------------------------
#
# License: WTFPL
# Authors: Leberwurscht, Valérian Saliou
#

#
# Usage example:
# --------------
#
# - $ ./extract_mini.sh
# - move the newly created mini/ directory onto your webserver
# - Create index.html:
#     <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
#     <script type="text/javascript" src="/mini/javascripts/mini.js"></script>
#     <script type="text/javascript">
#       jQuery(document).ready(function() {
#         JAPPIX_STATIC = "/mini/";
#         HOST_BOSH = "https://bind.jappix.com/"
#
#         JappixMini.launch({
#           connection: {
#             user: 'username',
#             password: 'password',
#             domain: 'server.tld'
#           },
#           application: {
#             network: {
#               autoconnect: true
#             },
#             interface: {
#               showpane: false
#             }
#           }
#         });
#       });
#     </script>
#

# absolute path to script
ABSPATH=$(cd "$(dirname "$0")"; pwd)

# standard settings
BASE_DIR="$ABSPATH/.."
SOURCE_DIR="$BASE_DIR/app"
TARGET_DIR="$BASE_DIR/mini"
LICENSE=MPL

# parse command line options
while getopts "t:l:h" opt; do
  case $opt in
    t) # target directory
      TARGET_DIR="$OPTARG"
      ;;
    l) # license setting
      case $OPTARG in
        MPL)
          LICENSE=MPL
          ;;
        AGPL)
          LICENSE=AGPL
          ;;
        *)
          echo "Invalid license '$OPTARG' - need MPL or AGPL" >&2
          exit 1
          ;;
      esac
      ;;
    h) # help
      echo "Usage: $0 [-h] [-t TARGET_DIR] [-l MPL|AGPL]" >&2
      exit 1
      ;;
  esac
done

# set compatible licenses and file header
if [ "$LICENSE" == "MPL" ]; then
  COMPATIBLE_LICENSES="PD MPL MIT WTFPL"
  LICENSE_HEADER='/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *'
fi
if [ "$LICENSE" == "AGPL" ]; then
  COMPATIBLE_LICENSES="PD MPL MIT WTFPL AGPL GPL"
  LICENSE_HEADER='/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *'
fi

LICENSE_HEADER="$LICENSE_HEADER"'
 *
 * This compound file may be composed of several subfiles by different authors.
 * The particular authors, copyright information, disclaimers and alternative
 * licenses for the subfiles are indicated in separate headers.
 *
 */'

# create directory
if [ -e "$TARGET_DIR" ]; then
  echo "Target directory '$TARGET_DIR' already exists. Doing nothing." >&2
  exit 1
else
  echo "Extracting Jappix Mini into directory '$TARGET_DIR'" >&2
  mkdir "$TARGET_DIR"
fi

mkdir "$TARGET_DIR/stylesheets/"
mkdir "$TARGET_DIR/javascripts/"
mkdir "$TARGET_DIR/images/"

# define license check function
check_license()
{
  filename=$1
  allowed_licenses=$2

  # find licenses line of this file
  LICENSES="`head $filename | grep -i 'Licenses\?:\|Licensed under'`"

  # make sure this line contains a compatible license
  match=0
  matching_license=""
  for license in $allowed_licenses; do
    if [ `echo $LICENSES | grep -c "\(\W\|\<\)$license\(\W\|\>\)"` -gt 0 ]; then
      match=1
      matching_license="$license"
    fi
    if [ $license == "MPL" -a `echo $LICENSES | grep -c "\(\W\|\<\)\(Mozilla Public License version 1.1\|MPLv2\)\(\W\|\>\)"` -gt 0 ]; then
      match=1
      matching_license="$license"
    fi
  done
  if [ $match -eq 0 ]; then
    echo >&2
    echo "ERROR: Could not detect a $LICENSE-compatible license for file '$filename'!" >&2
    rm -r -- "$TARGET_DIR"
    exit 1
  else
    echo "$filename detected to be licensed under the $LICENSE-compatible license $matching_license:"
    echo -en "\t"
    echo "$LICENSES"
  fi
}

# create compound javascript file
echo "$LICENSE_HEADER" > "$TARGET_DIR/javascripts/mini.js"

JS_FILES="`cat $SOURCE_DIR/bundles/mini.xml | sed -n "s/.*<js>\(.*\)<\/js>.*/\1/p" | sed "s/~/ /g"`"
for js_file in $JS_FILES; do
  check_license "$SOURCE_DIR/javascripts/$js_file" "$COMPATIBLE_LICENSES"

  # add to compound file removing UTF-8 byte order mark
  cat "$SOURCE_DIR/javascripts/$js_file" | sed s/^\\xef\\xbb\\xbf// >> "$TARGET_DIR/javascripts/mini.js"
done

# simple configuraton
cat >> "$TARGET_DIR/javascripts/mini.js" << EOF

// Configuration
XML_LANG = 'en';
JAPPIX_VERSION = jQuery.trim('`cat $BASE_DIR/VERSION`');
JAPPIX_STATIC = '/mini/';
EOF

# create compound style sheet file
echo "$LICENSE_HEADER" > "$TARGET_DIR/stylesheets/mini.css"

CSS_FILES="`cat $SOURCE_DIR/bundles/mini.xml | sed -n "s/.*<css>\(.*\)<\/css>.*/\1/p" | sed "s/~/ /g"`"
for css_file in $CSS_FILES; do
  check_license "$SOURCE_DIR/stylesheets/$css_file" "$COMPATIBLE_LICENSES"

  # add to compound file removing UTF-8 byte order mark
  cat "$SOURCE_DIR/stylesheets/$css_file" | sed s/^\\xef\\xbb\\xbf// >> "$TARGET_DIR/stylesheets/mini.css"
done

# copy artwork
# mini.png, mini.gif, animate.png and animate.gif are licensed under CC-BY
mkdir -p "$TARGET_DIR/images/sprites/"
cp "$SOURCE_DIR/images/sprites/mini.gif" "$TARGET_DIR/images/sprites/mini.gif"
cp "$SOURCE_DIR/images/sprites/mini.png" "$TARGET_DIR/images/sprites/mini.png"
cp "$SOURCE_DIR/images/sprites/animate.png" "$TARGET_DIR/images/sprites/animate.png"
cp "$SOURCE_DIR/images/sprites/animate.gif" "$TARGET_DIR/images/sprites/animate.gif"

# copy wait-typing.gif
mkdir -p "$TARGET_DIR/images/wait/"
cp "$SOURCE_DIR/images/wait/wait-typing.gif" "$TARGET_DIR/images/wait/wait-typing.gif"

# copy blank.gif
mkdir -p "$TARGET_DIR/images/others/"
cp "$SOURCE_DIR/images/others/blank.gif" "$TARGET_DIR/images/others/blank.gif"

# copy sounds
# receive-message.mp3, receive-message.oga are licensed under CC-BY
mkdir -p "$TARGET_DIR/sounds/"
cp "$SOURCE_DIR/sounds/receive-message.mp3" "$TARGET_DIR/sounds/receive-message.mp3"
cp "$SOURCE_DIR/sounds/receive-message.oga" "$TARGET_DIR/sounds/receive-message.oga"

# license information
cat > "$TARGET_DIR/COPYING" << EOF
Code
----

The code is licensed under the $LICENSE, as indicated in the source files.

Artwork
-------

The files ./app/images/sprites/mini.png, ./app/images/sprites/mini.gif, ./app/images/sprites/animate.png, ./app/images/sprites/animate.gif and ./app/images/wait/wait-typing.gif were created by
Valérian Saliou and are dual-licensed under the Creative Commons Attribution 2.5
License and the Creative Commons Attribution 3.0 License.
They contain work from the FamFamFam Silk icon set by Mark James.

 * http://famfamfam.com/lab/icons/silk/
 * http://creativecommons.org/licenses/by/2.5/
 * http://creativecommons.org/licenses/by/3.0/
EOF
