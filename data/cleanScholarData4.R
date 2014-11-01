library(stringr)
setwd("/Users/thiakx/Documents/playground/educity/educity/data")
scholar=read.csv("scholarRaw.csv")

names(scholar)[4]="school"
scholar$school=as.character(scholar$school)
#some schools are seperated by newline
scholar$school=gsub("\n"," ",scholar$school)

#fix data
scholar$school=gsub(" Haw Chong Institution"," Hwa Chong Institution",scholar$school)
scholar$school=gsub("Singapore Management University","",scholar$school)
scholar$school=gsub("Singapore Sports School","",scholar$school)
scholar$school=gsub("American International School of Guangzhou ","",scholar$school)

scholar$Name.of.Scholar=gsub("*","",scholar$Name.of.Scholar) #remove * in name
scholar$Name.of.Scholar=gsub(",","",scholar$Name.of.Scholar) #remove , in name
scholar$Name.of.Scholar=str_trim(scholar$Name.of.Scholar) #fix extra spaces before and after name
scholar$Scholarship.Awarded=str_trim(scholar$Scholarship.Awarded) #fix extra spaces before and after name
scholar$Scholarship.Awarded=gsub(" \\)","\\)",scholar$Scholarship.Awarded) #remove space) in name

scholar$school=gsub("United World College of South East Asia","International Schools",scholar$school)
scholar$school=gsub("Hong Kong International School International Community School","International Schools",scholar$school)
scholar$school=gsub("International School of Beijing Chengdu International School","International Schools",scholar$school)
scholar$school=gsub("St. Mary's International School","International Schools",scholar$school)

#add ;to seperate sec and jc
#standardize: RJC = Raffles Institution, HJC=Hwa Chong Institution
scholar$school=gsub(" Raffles Institution",";Raffles Institution",scholar$school)
scholar$school=gsub(" Raffles Junior College",";Raffles Institution",scholar$school)
scholar$school=gsub(" Hwa Chong Institution",";Hwa Chong Institution",scholar$school)
scholar$school=gsub(" Hwa Chong Junior College",";Hwa Chong Institution",scholar$school)
scholar$school=gsub(" Anglo-Chinese Junior College",";Anglo-Chinese Junior College",scholar$school)
scholar$school=gsub(" Victoria Junior College",";Victoria Junior College",scholar$school)
scholar$school=gsub(" National Junior College",";National Junior College",scholar$school)
scholar$school=gsub(" Temasek Junior College",";Temasek Junior College",scholar$school)
scholar$school=gsub(" Catholic Junior College",";Catholic Junior College",scholar$school)
scholar$school=gsub(" Anderson Junior College",";Anderson Junior College",scholar$school)
scholar$school=gsub(" Nanyang Junior College",";Nanyang Junior College",scholar$school)
scholar$school=gsub(" Jurong Junior College",";Jurong Junior College",scholar$school)
scholar$school=gsub(" Pioneer Junior College",";Pioneer Junior College",scholar$school)
scholar$school=gsub(" Singapore Polytechnic",";Singapore Polytechnic",scholar$school)
scholar$school=gsub(" Ngee Ann Polytechnic",";Ngee Ann Polytechnic",scholar$school)
scholar$school=gsub(" Temasek Polytechnic",";Temasek Polytechnic",scholar$school)
scholar$school=gsub(" NUS High School ",";NUS High School",scholar$school)
scholar$school=gsub(" International Schools",";International Schools",scholar$school)

scholarSch=data.frame(str_split_fixed(scholar$school,";",n=2))
names(scholarSch)=c("secSch","postSecSch")

#if blank postSecSch, copy secSch over
scholarSch$secSch=as.character(scholarSch$secSch)
scholarSch$postSecSch=as.character(scholarSch$postSecSch)
scholarSch$secSch=str_trim(scholarSch$secSch)
scholarSch$postSecSch=str_trim(scholarSch$postSecSch)
scholarSch$postSecSch=ifelse(scholarSch$postSecSch=="",scholarSch$secSch,scholarSch$postSecSch)
scholar=cbind(scholar,scholarSch)

##Gender##
scholar$Gender=as.character(scholar$Gender)
scholar$Gender[scholar$Gender=="male"]="Male"
scholar$Gender[scholar$Gender==""]="Unknown"

##Prepare data for bubble##
# bubbleData=scholar[,c("Name.of.Scholar","Year.of.Award","postSecSch")]
names(scholar)=gsub("\\.","",names(scholar))
scholar$ScholarshipAwarded=gsub("\\(.*?\\)", "", scholar$ScholarshipAwarded) #remove all text in brackets
scholar$ScholarshipAwarded=gsub("Local-Overseas", "Local - Overseas", scholar$ScholarshipAwarded) 
scholar$ScholarshipAwarded=gsub("Medicine", "", scholar$ScholarshipAwarded) 
scholar$ScholarshipAwarded=gsub("-", "", scholar$ScholarshipAwarded) 
scholar$ScholarshipAwarded=gsub("^ *|(?<= ) | *$", "", scholar$ScholarshipAwarded, perl=T)#replace multiple spaces with one
scholar$type="All Scholars"
scholar=subset(scholar, select=-c(school,UniversityandCourseofStudy,Country))
scholar$LastKnownRole=gsub(",|Unknown|-","",scholar$LastKnownRole)
scholar$Organisation=gsub(",|Unknown|-","",scholar$Organisation)
scholar$secSch=gsub(",|Unknown|-","",scholar$secSch)
write.csv(scholar,"scholarData.csv",row.names=F)