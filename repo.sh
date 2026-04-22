# Set your starting point (e.g., roughly 80 days ago)
BASE_TIMESTAMP=$(date -d "80 days ago" +%s)

while true; do
  # 1. Add a random gap between commits (e.g., 1 to 4 days forward)
  # 86400 seconds = 1 day, 345600 seconds = 4 days
  RANDOM_GAP=$(shuf -i 86400-345600 -n 1)
  BASE_TIMESTAMP=$((BASE_TIMESTAMP + RANDOM_GAP))
  
  # 2. Format the new chronological date
  NEW_DATE=$(date -d "@$BASE_TIMESTAMP" +"%Y-%m-%d %H:%M:%S")
  
  # 3. Overwrite the author, email, and the progressive date
  git commit --amend --overwrite-date \
    --author="Utsav-56 <utsavpokhrel200@gmail.com>" \
    --no-edit \
    --date="$NEW_DATE"
  
  # 4. Move to the next commit. If we are done, break the loop.
  git rebase --continue || break
done