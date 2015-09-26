#! /bin/bash

ANNEX_SSH_PORT=$1
FRONTEND_PRIV_KEY=$2
ANNEX_USER=$3
ANNEX_HOST=$4

ssh -f -p $ANNEX_SSH_PORT -o IdentitiesOnly=yes -o PubkeyAuthentication=yes -i $FRONTEND_PRIV_KEY $ANNEX_USER@$ANNEX_HOST 'echo ""'
if [[ $? -eq 0 ]]; then
	echo "Annex successfully linked!"
else
	echo "There was an error linking the Annex."
fi