FILES=$(find | grep .xhtml)
for file in $FILES
do
firefox $file
done
