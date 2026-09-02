#!/bin/bash
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
NGINX_CONTAINER="nginx-gateway"
CONF_DIR="nginx/conf.d"

# 1. Figure out which color is currently live by reading the active config
if grep -q "web-blue" "$CONF_DIR/active.conf"; then
    CURRENT="blue"
    NEW="green"
else
    CURRENT="green"
    NEW="blue"
fi

echo "Current live color: $CURRENT"
echo "Deploying new color: $NEW"

# 2. Pull the latest images and bring up ONLY the new color (old color keeps serving traffic untouched)
docker compose -f "$COMPOSE_FILE" pull
docker compose -f "$COMPOSE_FILE" --profile "$NEW" up -d

# 3. Health check the new containers — via the nginx container, since it shares
#    the app-network and can resolve web-$NEW / api-$NEW by name.
echo "Waiting for new containers to become healthy..."
RETRIES=10
SLEEP=3
HEALTHY=false

for i in $(seq 1 "$RETRIES"); do
    if docker exec "$NGINX_CONTAINER" wget -q -O - --timeout=3 "http://api-$NEW:3000/health" > /dev/null 2>&1 \
       && docker exec "$NGINX_CONTAINER" wget -q -O - --timeout=3 "http://web-$NEW:8000/status" > /dev/null 2>&1; then
        HEALTHY=true
        break
    fi
    echo "Attempt $i/$RETRIES not ready yet, retrying in ${SLEEP}s..."
    sleep "$SLEEP"
done

if [ "$HEALTHY" != "true" ]; then
    echo "Health check FAILED. Removing new ($NEW) containers, keeping $CURRENT live."
    docker compose -f "$COMPOSE_FILE" rm -sf "web-$NEW" "api-$NEW"
    exit 1
fi

echo "Health check passed. Switching traffic to $NEW."

# 4. Swap nginx's routing config and reload — this is the zero-downtime moment.
#    nginx -s reload re-reads config without dropping the listening socket.
cp "$CONF_DIR/active.$NEW.conf" "$CONF_DIR/active.conf"
docker exec "$NGINX_CONTAINER" nginx -s reload

# 5. Now that traffic is on the new color, tear down the old one.
#    IMPORTANT: target services by NAME, not --profile — nginx has no profile
#    of its own, so a --profile-based "down" would incorrectly stop it too.
echo "Stopping old ($CURRENT) containers."
docker compose -f "$COMPOSE_FILE" rm -sf "web-$CURRENT" "api-$CURRENT"

echo "Deploy complete. Live color is now: $NEW"