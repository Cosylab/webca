FILES=$(find | grep .xhtml)
for file in $FILES
do
rm $file
done
