library(stringr)
library(plyr)
setwd("/Users/thiakx/Documents/playground/educity/educity/data")
scholar=read.csv("scholarRaw.csv")

scholar=scholar[!scholar$Name.of.Scholar=="",]

scholar$Name.of.Scholar=gsub("*","",scholar$Name.of.Scholar) #remove * in name
scholar$Name.of.Scholar=gsub(",","",scholar$Name.of.Scholar) #remove , in name
scholar$Name.of.Scholar=str_trim(scholar$Name.of.Scholar) #fix extra spaces before and after name
scholar$Scholarship.Awarded=str_trim(scholar$Scholarship.Awarded) #fix extra spaces before and after name
scholar$Scholarship.Awarded=gsub(" \\)","\\)",scholar$Scholarship.Awarded) #remove space) in name

names(scholar)[4]="jcPoly"
scholar$jcPoly=gsub("\\-"," ",scholar$jcPoly)
scholar$school="Unknown"
scholar$school[grep("Raffles Institution|Raffles Junior College",scholar$jcPoly,ignore.case = T)]="Raffles Institution"
scholar$school[grep("Haw Chong Institution|Hwa Chong Institution|Hwa Chong Junior College",scholar$jcPoly,ignore.case = T)]="Hwa Chong Institution"
scholar$school[grep("Singapore Sports School",scholar$jcPoly,ignore.case = T)]="Singapore Sports School"
scholar$school[grep("International School|United World College of South East Asia",scholar$jcPoly,ignore.case = T)]="International Schools"
scholar$school[grep("Anglo Chinese Junior College",scholar$jcPoly,ignore.case = T)]="Anglo Chinese Junior College"
scholar$school[grep("Anglo Chinese School \\(Independent\\)",scholar$jcPoly,ignore.case = T)]="Anglo Chinese School (Independent)"
scholar$school[grep("Victoria Junior College",scholar$jcPoly,ignore.case = T)]="Victoria Junior College"
scholar$school[grep("National Junior College",scholar$jcPoly,ignore.case = T)]="National Junior College"
scholar$school[grep("Temasek Junior College",scholar$jcPoly,ignore.case = T)]="Temasek Junior College"
scholar$school[grep("Catholic Junior College",scholar$jcPoly,ignore.case = T)]="Catholic Junior College"
scholar$school[grep("Anderson Junior College",scholar$jcPoly,ignore.case = T)]="Anderson Junior College"
scholar$school[grep("Nanyang Junior College",scholar$jcPoly,ignore.case = T)]="Nanyang Junior College"
scholar$school[grep("Jurong Junior College",scholar$jcPoly,ignore.case = T)]="Jurong Junior College"
scholar$school[grep("Pioneer Junior College",scholar$jcPoly,ignore.case = T)]="Pioneer Junior College"
scholar$school[grep("Singapore Polytechnic",scholar$jcPoly,ignore.case = T)]="Singapore Polytechnic"
scholar$school[grep("Ngee Ann Polytechnic",scholar$jcPoly,ignore.case = T)]="Ngee Ann Polytechnic"
scholar$school[grep("Temasek Polytechnic",scholar$jcPoly,ignore.case = T)]="Temasek Polytechnic"
scholar$school[grep("Singapore Polytechnic",scholar$jcPoly,ignore.case = T)]="Singapore Polytechnic"
scholar$school[grep("NUS High School",scholar$jcPoly,ignore.case = T)]="NUS High School"
scholar$school[grep("Singapore Polytechnic",scholar$jcPoly,ignore.case = T)]="Singapore Polytechnic"
scholar$school[grep("Dunman High School",scholar$jcPoly,ignore.case = T)]="Dunman High School"
scholar$school[grep("River Valley High School",scholar$jcPoly,ignore.case = T)]="River Valley High School"
scholar$school[grep("St Joseph's Institution",scholar$jcPoly,ignore.case = T)]="St Joseph's Institution"
scholar$school[grep("Singapore Polytechnic",scholar$jcPoly,ignore.case = T)]="Singapore Polytechnic"

##Gender##
scholar$Gender=as.character(scholar$Gender)
scholar$Gender[scholar$Gender=="male"]="Male"
scholar$Gender[scholar$Gender==""]="Unknown"

##Prepare data for chart##
keepTop = function(factorIn,varNum){
  tempCol=data.frame(summary(factorIn))
  names(tempCol)="count"  
  tempCol$var=row.names(tempCol)
  #if there is already an others column, count that as 0
  if(any(tempCol$var %in% c("Others"))){tempCol$count[tempCol$var=="Others"]=0}
  tempCol=tempCol[order(tempCol$count,decreasing=T),]
  topVar=tempCol$var[1:varNum]
  factorIn=as.character(factorIn)
  factorIn[!factorIn %in% topVar]="Others"
  factorIn=as.factor(factorIn)
  return (factorIn)
}

bracketXtract = function(txt, br = c("(", "[", "{", "all"), with=FALSE) {
    br = match.arg(br)
    left =      # what pattern are we looking for on the left?
      if ("all" == br) "\\(|\\{|\\["
    else sprintf("\\%s", br)
    map =         # what's the corresponding pattern on the right?
      c(`\\(`="\\)", `\\[`="\\]", `\\{`="\\}",
        `\\(|\\{|\\[`="\\)|\\}|\\]")
    fmt =         # create the appropriate regular expression
      if (with) "(%s).*?(%s)"
    else "(?<=%s).*?(?=%s)"
    re = sprintf(fmt, left, map[left])
    regmatches(txt, gregexpr(re, txt, perl=TRUE))    # do it!
  }

colsToKeep=c("school","Scholarship.Awarded","Gender","Course","Organisation")
scholar2=scholar[,colsToKeep]
names(scholar2)=c("School","Scholarship","Gender","Course","Organisation")
scholar2 = data.frame(sapply(scholar2,as.factor))

#scholar2 = data.frame(sapply(scholar2,keepTop))
#gender no need reduce

#need manual cleaning?or signature matching
scholar2$Scholarship=as.character(scholar2$Scholarship)
scholar2$ScholarshipTemp=scholar2$Scholarship
scholar2$Scholarship[grep("Overseas Merit Scholarship",scholar2$ScholarshipTemp,ignore.case = T)]="Overseas Merit Scholarship"
scholar2$Scholarship[grep("Local - Overseas Merit Scholarship",scholar2$ScholarshipTemp,ignore.case = T)]="Local-Overseas Merit Scholarship"
scholar2$Scholarship[grep("Local Merit Scholarship",scholar2$ScholarshipTemp,ignore.case = T)]="Local Merit Scholarship"
scholar2$Scholarship[grep("SAF",scholar2$ScholarshipTemp,ignore.case = T)]="SAF's Scholarship"
scholar2$Scholarship[grep("SPF",scholar2$ScholarshipTemp,ignore.case = T)]="SPF's Scholarship"
scholar2$Scholarship[grep("Singapore Government Scholarship",scholar2$ScholarshipTemp,ignore.case = T)]="SG Government Scholarship"
scholar2$Scholarship[grep("MAS|Master",scholar2$ScholarshipTemp,ignore.case = T)]="Others"
scholar2$Scholarship[grep("President",scholar2$ScholarshipTemp,ignore.case = T)]="President's Scholarship"
scholar2$Scholarship=as.factor(scholar2$Scholarship)
# 
# scholar2$Scholarship=as.character(scholar2$Scholarship)
# scholar2$Scholarship[grep("Local - Overseas Merit Scholarship",scholar2$Scholarship,ignore.case = T)]="Local-Overseas Merit Scholarship"
# scholar2$Scholarship[grep("Local Merit Scholarship",scholar2$Scholarship,ignore.case = T)]="Local Merit Scholarship"
# scholar2$Scholarship[grep("Local Merit Scholarship President's Scholarship",scholar2$Scholarship,ignore.case = T)]="Local Merit Scholarship-President's Scholarship"
# scholar2$Scholarship[grep("Local-Overseas Merit Scholarship",scholar2$Scholarship,ignore.case = T)]="Local-Overseas Merit Scholarship"
# scholar2$Scholarship[grep("Overseas Merit Scholarship",scholar2$Scholarship,ignore.case = T)]="Overseas Merit Scholarship"
# scholar2$Scholarship[grep("Overseas Merit Scholarship-President's Scholarship",scholar2$Scholarship,ignore.case = T)]="Overseas Merit Scholarship-President's Scholarship"
# scholar2$Scholarship[grep("Local-Overseas Merit Scholarship",scholar2$Scholarship,ignore.case = T)]="Local-Overseas Merit Scholarship"
# scholar2$Scholarship[grep("SAF",scholar2$Scholarship,ignore.case = T)]="SAF's Scholarship"
# scholar2$Scholarship[grep("SPF",scholar2$Scholarship,ignore.case = T)]="SPF's Scholarship"
# scholar2$Scholarship[grep("Singapore Government Scholarship",scholar2$Scholarship,ignore.case = T)]="Singapore Government Scholarship"
# scholar2$Scholarship=as.factor(scholar2$Scholarship)

scholar2$Organisation=as.character(scholar2$Organisation)
scholar2$Organisation[grep("Pte Ltd|Consulting|Technologies|Technology|ebay|Cargill|EMA|SHS Cardiology|SingTel",scholar2$Organisation,ignore.case = T)]="Private Sector"

# label ministries
scholar2$Organisation[grep("Ministry",scholar2$Organisation,ignore.case = T)]="Ministries"
scholar2$Organisation[grep("MEWR",scholar2$Organisation)]="Ministries"

#label smaller ministires with "other ministries"
# scholar2$Ministry=0
# scholar2$Ministry[grep("Ministry",scholar2$Organisation,ignore.case = T)]=1
# tempCol=data.frame(summary(as.factor(scholar2$Organisation)))
# names(tempCol)="count"
# tempCol$var=row.names(tempCol)
# topVar=tempCol$var[tempCol$count>=10]
# scholar2$Organisation[scholar2$Ministry==1&(!scholar2$Organisation %in% topVar)]="Other Ministries"
# scholar2$Organisation[grep("MEWR",scholar2$Organisation)]="Other Ministries"
# scholar2$Ministry=NULL

#replace all org with brackets like (MOE) with just their shortform in brackets
govtOrg=grep("\\(",scholar2$Organisation)
scholar2$Organisation[govtOrg]=bracketXtract(scholar2$Organisation[govtOrg],"all")

#label govt linked org
scholar2$Organisation[grep("AVA|Competition Commission Of Singapore|HPB|Lee Kuan Yew School of Public Policy|LTA|MDA|PA|STB|SUPCOURT|WDA",scholar2$Organisation,ignore.case = T)]="Other Govt Linked"

#set unknown org to others
scholar2$Organisation[scholar2$Organisation=="Unknown"]="Others"
scholar2$Organisation=as.factor(as.character(scholar2$Organisation))

#edit course errors
scholar2$Course[grep("Engineering + Economics",scholar2$Course)]="Engineering and Economics" 
scholar2$Course=as.character(scholar2$Course)
scholar2$CourseTemp=scholar2$Course
scholar2$Course[grep("Science|Biology|Chemistry",scholar2$CourseTemp,ignore.case = T)]="Science"
scholar2$Course[grep("Engineering",scholar2$CourseTemp,ignore.case = T)]="Engineering"
scholar2$Course=as.factor(scholar2$Course)

#reduce levels of factor
scholar2$School=keepTop(scholar2$School,4)
scholar2$Course=keepTop(scholar2$Course,4)
scholar2$Scholarship=keepTop(scholar2$Scholarship,3)
scholar2$Organisation=keepTop(scholar2$Organisation,3)

write.csv(scholar2,"scholarData2.csv",row.names=F)
