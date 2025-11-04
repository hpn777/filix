#!/bin/bash

CONTAINERS=("paramdb_migration" "appdata_migration")
STATUS=0
SLEEP_INTERVAL=5

for container in "${CONTAINERS[@]}"; do
  echo "Checking status for container: $container"

  while true; do
    CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' "$container")

    if [ "$CONTAINER_STATUS" == "exited" ]; then
      echo "Container $container has exited."
      break
    else
      echo "Container $container is not exited yet. Current status: $CONTAINER_STATUS. Checking again in $SLEEP_INTERVAL seconds..."
      sleep $SLEEP_INTERVAL
    fi
  done

  EXIT_CODE=$(docker inspect --format='{{.State.ExitCode}}' "$container")

  if [ "$EXIT_CODE" -eq 0 ]; then
    echo "Container $container exited successfully. Exit code: $EXIT_CODE"
  else
    echo "Container $container exited with an error. Exit code: $EXIT_CODE"
    STATUS=1
  fi
done

if [ "$STATUS" -eq 0 ]; then
  echo "All containers exited successfully."
else
  echo "One or more containers exited with an error."
  exit 1
fi
