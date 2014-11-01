library(reshape2)
setwd("/Users/thiakx/Documents/playground/educity/educity/data")
dashData=read.csv("dashboardRaw.csv")

#json
library(jsonlite)
govtExpend=read.csv("govtExpend.csv")
CPI=read.csv("CPI.csv")
CPI=CPI[CPI$Year>=min(govtExpend$Year)&CPI$Year<=max(govtExpend$Year),]
baseYr=2012
govtExpend$GovtExpenditureEdu=govtExpend$GovtExpenditureEdu*(CPI$CPI[CPI$Year==2012]/CPI$CPI)
govtExpend$GovtExpenditureEdu=round(govtExpend$GovtExpenditureEdu/1000000000,2)
sink("govtExpend.json")
cat(toJSON(govtExpend))
sink()

dashDataEnrol=dashData[,c("Year","Enrolment..Primary","Enrolment..Secondary")]
dashDataEnrol=dashDataEnrol[complete.cases(dashDataEnrol),]
names(dashDataEnrol)=c("year","primary","secondary")
dashDataEnrol$primary=round(dashDataEnrol$primary/1000)
dashDataEnrol$secondary=round(dashDataEnrol$secondary/1000)
sink("enrol.json")
cat(toJSON(dashDataEnrol))
sink()

dashDataParity=dashData[,c("Year","gender_parity_pri","gender_parity_sec","gender_parity_ter")]
dashDataParity=dashDataParity[complete.cases(dashDataParity),]
names(dashDataParity)=c("year","primary","secondary","tertiary")
sink("parity.json")
cat(toJSON(dashDataParity))
sink()

dashDataRace=dashData[,c("Year","Malay_PostSec","Chinese_PostSec","Indian_PostSec","Overall_PostSec")]
dashDataRace=dashDataRace[complete.cases(dashDataRace),]
names(dashDataRace)=c("year","Malay","Chinese","Indian","Overall")
sink("race.json")
cat(toJSON(dashDataRace))
sink()

dashDataTeacher=dashData[,c("Year","Pupil_Teacher_Primary","Pupil_Teacher_Secondary")]
dashDataTeacher=dashDataTeacher[complete.cases(dashDataTeacher),]
names(dashDataTeacher)=c("year","primary","secondary")
sink("teacher.json")
cat(toJSON(dashDataTeacher))
sink()

dashDataSch=dashData[,c("Year","Number.of.primary.school","Number.of.secondary.school")]
dashDataSch=dashDataSch[complete.cases(dashDataSch),]
names(dashDataSch)=c("year","primary","secondary")
sink("sch.json")
cat(toJSON(dashDataSch))
sink()



# #csv
# dashDataParity=melt(dashData[,c("Year","gender_parity_pri","gender_parity_sec","gender_parity_ter")],
#                   id.vars = "Year",variable.name="gender",value.name = "gender_parity",na.rm = T)
# dashDataParity$gender=gsub("gender_parity_","",dashDataParity$gender)
# 
# dashDataRace=melt(dashData[,c("Year","Malay_PostSec","Chinese_PostSec","Indian_PostSec","Overall_PostSec")],
#                   id.vars = "Year",variable.name="race",value.name = "PostSecondaryEdu",na.rm = T)
# dashDataRace$race=gsub("_PostSec","",dashDataRace$race)
# 
# dashDataTeacher=melt(dashData[,c("Year","Pupil_Teacher_Primary","Pupil_Teacher_Secondary")],
#                   id.vars = "Year",variable.name="pri_sec",value.name = "TeacherPupilRatio",na.rm = T)
# dashDataTeacher$pri_sec=gsub("Pupil_Teacher_","",dashDataTeacher$pri_sec)
# 
# dashDataSch=melt(dashData[,c("Year","Number.of.primary.school","Number.of.secondary.school")],
#                      id.vars = "Year",variable.name="pri_sec",value.name = "NumberOfSch",na.rm = T)
# dashDataSch$pri_sec=gsub("Number.of.","",dashDataSch$pri_sec)
# dashDataSch$pri_sec=gsub(".school","",dashDataSch$pri_sec)
# 
# dashDataEnrol=melt(dashData[,c("Year","Enrolment..Primary","Enrolment..Secondary")],
#                  id.vars = "Year",variable.name="pri_sec",value.name = "Enrolment",na.rm = T)
# dashDataEnrol$pri_sec=gsub("Enrolment..","",dashDataEnrol$pri_sec)

# write.csv(dashDataParity,"parity.csv",row.names=F,quote=F)
# write.csv(dashDataRace,"raceData.csv",row.names=F,quote=F)
# write.csv(dashDataTeacher,"teacher.csv",row.names=F,quote=F)
# write.csv(dashDataSch,"sch.csv",row.names=F,quote=F)
# write.csv(dashDataEnrol,"enrol.csv",row.names=F,quote=F)
