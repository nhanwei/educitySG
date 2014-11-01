library(reshape2)
setwd("/yourpath")
dashData=read.csv("dashboardRaw.csv")
govtExpend=read.csv("govtExpend.csv")
dashData=merge(dashData,govtExpend,by="Year",all.x=T)

#select from 2003 onwards(all got data)
dashData=dashData[dashData$Year>=2003 & dashData$Year<2013,]
baseData=as.numeric(dashData[dashData$Year==2003,2:length(dashData)])
dashDataCombine=sweep(dashData[dashData$Year>2003,2:length(dashData)],2,baseData,"/")
dashDataCombine=round((dashDataCombine-1),2) 
dashDataCombine$Year=dashData$Year[dashData$Year>2003]
names(dashDataCombine)=c("PriSchGenParity","SecSchGenParity","TerSchGenParity","MalayPostSec","ChinesePostSec","IndianPostSec","OverallPostSec",
                         "PriSchPupilTeacher","SecSchPupilTeacher","PSLEPass","NOLvlPass","AlvlPass","PriSchNum","SecSchNum","PriEnrolment","MalePriEnrolment",
                         "FemalePriEnrolment","SecEnrolment","MaleSecEnrolment","FemaleSecEnrolment","GovtExpenditureEdu","Year")

write.csv(names(dashDataCombine),"names.csv",row.names=F)

dashDataCombine2=as.data.frame(t(dashDataCombine))
names(dashDataCombine2)=dashDataCombine$Year
dashDataCombine2=dashDataCombine2[!row.names(dashDataCombine2)=="Year",]
kCluster=kmeans(dashDataCombine2,6)
dashDataCombine2$cluster=kCluster$cluster
dashDataCombine2=dashDataCombine2[order(dashDataCombine2$cluster),]

#json
library(jsonlite)
sink("dashDataCombine.json")
cat(toJSON(dashDataCombine))
sink()
