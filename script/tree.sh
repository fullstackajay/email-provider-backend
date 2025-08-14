#!/bin/bash

# Script to list directory contents in a tree-like structure
# Usage: ./tree.sh [directory_path]
# If no directory_path is provided, it uses the current directory.

TARGET_DIR="${1:-.}" # Use provided argument or default to current directory

# Function to recursively list directory contents
# $1: current directory path
# $2: prefix string for indentation and tree characters
list_contents_recursive() {
    local current_path="$1"
    local parent_prefix="$2"
    local i=0

    # Get all entries (files and directories) in the current_path, sorted.
    # -maxdepth 1: only direct children
    # -mindepth 1: exclude the current_path itself from find's output
    # -print0 and read -d $'\0': robust for filenames with spaces or special chars
    local entries=()
    while IFS= read -r -d $'\0' entry; do
        entries+=("$entry")
    done < <(find "$current_path" -maxdepth 1 -mindepth 1 -print0 | sort -z)

    local num_entries=${#entries[@]}

    for (( i=0; i<num_entries; i++ )); do
        local full_path="${entries[$i]}"
        local item_name
        item_name=$(basename "$full_path") # Get just the name of the file/dir

        local connector # The "├── " or "└── " part
        local child_prefix_extension # The "│   " or "    " part for the next level

        if [ $i -eq $((num_entries - 1)) ]; then
            # Last item in the current directory
            connector="└── "
            child_prefix_extension="    " # No vertical bar needed for children of the last item
        else
            # Not the last item
            connector="├── "
            child_prefix_extension="│   " # Vertical bar needed
        fi

        local display_name="$item_name"
        if [ -d "$full_path" ]; then
            display_name+="/" # Add trailing slash to directories
        fi

        # Print the current item
        echo "${parent_prefix}${connector}${display_name}"

        # If it's a directory, recurse
        if [ -d "$full_path" ]; then
            list_contents_recursive "$full_path" "${parent_prefix}${child_prefix_extension}"
        fi
    done
}

# Start the process
echo "." # Print the root directory indicator
list_contents_recursive "$TARGET_DIR" "" # Initial call: no prefix for the first level items