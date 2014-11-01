setwd("/Users/thiakx/Documents/playground/educity/educity/data")
#json
library(jsonlite)
timeLine=read.csv("TimelineData.csv")
timeLine=timeLine[,1:6]
names(timeLine)=c("startDate","headline","text","media","credit","caption")
timeLine$startDate=as.character(timeLine$startDate)

timeLine=data.frame(sapply(timeLine, function(x) gsub("\"","'",x)))
timeLine$headline=gsub("\"","'",timeLine$headline)
timeLine$text=gsub("\"","'",timeLine$text)
timeLine$text=gsub("n<br","<br",timeLine$text)

#1st row as header,create assets
header=timeLine[1,]
header$type="default"
header=header[,c("headline","type","startDate","text","media","credit","caption")]
header=toJSON(header)
header=gsub("\"media\"","\"asset\":{\"media\"",header)
#header=gsub("\\\\","",header)
header=gsub("\\[","",header)
header=gsub("\\]","\\,\"date\":",header)
header=gsub("\"headline\"","\"timeline\":{\"headline\"",header)

#create assets for rest of data
timeLine=timeLine[2:nrow(timeLine),]
timeLine=toJSON(timeLine)
timeLine=gsub("\"media\"","\"asset\":{\"media\"",timeLine)
#timeLine=gsub("\\\\","",timeLine)
timeLine=gsub("},","}},",timeLine)
timeLine=gsub("]","}]}}",timeLine)

sink("TimelineData.json")
header
timeLine
sink()

