

if [ -z "$1" ]
then
      read -p 'listener type ( mirror or balance ) : ' type
else
      type=$1

fi


npx nestjs-command listener:run --type $type
