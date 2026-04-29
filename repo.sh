git filter-branch --force --env-filter '
  # 1. Hardcode your identity details
  export GIT_AUTHOR_NAME="Utsav-56"
  export GIT_AUTHOR_EMAIL="utsavpokhrel200@gmail.com"
  export GIT_COMMITTER_NAME="Utsav-56"
  export GIT_COMMITTER_EMAIL="utsavpokhrel200@gmail.com"

  # 2. Establish the exact absolute anchor point (90 days ago)
  # Every repository has an internal counter or we can track steps.
  # To bypass subshell variable resets, we can read/write a temporary counter file.
  COUNTER_FILE="$GIT_DIR/custom_timeline_counter"
  
  if [ ! -f "$COUNTER_FILE" ]; then
    # Start exactly 85 days ago in seconds
    START_EPOCH=$(date -d "85 days ago" +%s)
    echo "$START_EPOCH" > "$COUNTER_FILE"
  fi

  CURRENT_EPOCH=$(cat "$COUNTER_FILE")

  # 3. Add your brilliant 2 to 7 days random gap (in seconds)
  # 2 days = 172800s, 7 days = 604800s
  RANDOM_GAP=$(shuf -i 172800-604800 -n 1)
  NEXT_EPOCH=$((CURRENT_EPOCH + RANDOM_GAP))

  # Save the updated timestamp for the next commit loop
  echo "$NEXT_EPOCH" > "$COUNTER_FILE"

  # 4. Format the date cleanly for Git
  NEW_DATE=$(date -d "@$CURRENT_EPOCH" +"%Y-%m-%d %H:%M:%S")
  export GIT_AUTHOR_DATE="$NEW_DATE"
  export GIT_COMMITTER_DATE="$NEW_DATE"
' --tag-name-filter cat -- --branches --tags