# Airtable Data Dictionary

Base: `app34330Do0nm4qvM` (generated 2025-10-08T08:24:22.305Z)

## Teachers

| Field | Type | Options |
|---|---|---|
| Teacher Name | singleLineText |  |
| Qualifications | multilineText |  |
| Subjects Taught | singleLineText |  |
| Availability | singleLineText |  |
| Profile Photo | multipleAttachments | `{"isReversed":true}` |
| Institute | multipleRecordLinks | `{"linkedTableId":"tbl1XRPop3NNcAaxF","isReversed":false,"prefersSingleRecordLink":true,"inverseLinkFieldId":"fldbpGN6QJdo4BbBs"}` |
| Contact Information | singleLineText |  |
| Students | multipleRecordLinks | `{"linkedTableId":"tbl1cOkQ1qMbeZgn4","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fld7K9mDZUoOBWmE5"}` |
| Rating | rating | `{"icon":"star","max":5,"color":"yellowBright"}` |
| Fee | singleLineText |  |
| Distance | singleLineText |  |
| Course 1 | singleLineText |  |
| Course 2 | singleLineText |  |
| Institute Name | singleLineText |  |
| Booking | multipleRecordLinks | `{"linkedTableId":"tblPJkcyttJNPf82U","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"flddbfA6SEAq5LfEf"}` |

## Institutes

| Field | Type | Options |
|---|---|---|
| Institute Name | singleLineText |  |
| Location | singleLineText |  |
| Courses Offered | multipleSelects | `{"choices":[{"id":"selZqqeNHpPPy2CXo","name":"Mathematics","color":"blueLight2"},{"id":"selAqGS7mEBb0xCTy","name":"Science","color":"cyanLight2"},{"id":"selw3zZUcgkDY24Js","name":"Arts","color":"tealLight2"},{"id":"selfEvt4SOG6iXdk0","name":"Technology","color":"greenLight2"},{"id":"sel3N6eIyKJ7hXDbX","name":"Languages","color":"yellowLight2"},{"id":"selfoc5CwSXqST6iD","name":"Business","color":"orangeLight2"},{"id":"seltsXRC3z7nlA7sB","name":"Humanities","color":"redLight2"}]}` |
| Contact Details | multilineText |  |
| Institute Photo | multipleAttachments | `{"isReversed":true}` |
| Teachers | multipleRecordLinks | `{"linkedTableId":"tblyQHaIDP4yP7ppJ","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldB2IAYy6ADVQxbq"}` |
| Students | multipleRecordLinks | `{"linkedTableId":"tbl1cOkQ1qMbeZgn4","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldnEj0jFPLU7QTOB"}` |
| Courses | multipleRecordLinks | `{"linkedTableId":"tblTh2jUWSVxg4iUz","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldjPwF8upGi7Omu8"}` |
| Teachers 2 | singleLineText |  |
| Teachers 3 | singleLineText |  |

## Students

| Field | Type | Options |
|---|---|---|
| Student ID | singleLineText |  |
| First Name | singleLineText |  |
| Last Name | singleLineText |  |
| Date of Birth | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Email | singleLineText |  |
| Phone Number | singleLineText |  |
| Profile Photo | multipleAttachments | `{"isReversed":true}` |
| Enrolled Courses | multipleRecordLinks | `{"linkedTableId":"tbl1XRPop3NNcAaxF","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldp1l5G158WuyN5Q"}` |
| Address | multilineText |  |
| Emergency Contact | singleLineText |  |
| Teacher | multipleRecordLinks | `{"linkedTableId":"tblyQHaIDP4yP7ppJ","isReversed":false,"prefersSingleRecordLink":true,"inverseLinkFieldId":"fld4ArahWCLVcyrh7"}` |
| Performance Records | multipleRecordLinks | `{"linkedTableId":"tbluIGW2rsO1lhDf9","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldliPcxL9XrK99UK"}` |
| Attendance Records | multipleRecordLinks | `{"linkedTableId":"tblQQ6TNTxJhV88sl","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldYW0tzNeEwXXhx3"}` |
| Assignments | multipleRecordLinks | `{"linkedTableId":"tbl0tbIWrxn8olVWJ","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldcFvC29jPUSOJlM"}` |
| Class Schedules | multipleRecordLinks | `{"linkedTableId":"tblXiMEfCxenxGCLq","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldJ2DTp2QYzBTHTr"}` |
| Parents | multipleRecordLinks | `{"linkedTableId":"tbl65zvwLPaytsFjU","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldT41mtQWcloZCI7"}` |

## Student Performance Records

| Field | Type | Options |
|---|---|---|
| Course | singleLineText |  |
| Student | multipleRecordLinks | `{"linkedTableId":"tbl1cOkQ1qMbeZgn4","isReversed":false,"prefersSingleRecordLink":true,"inverseLinkFieldId":"fld0oXDRFDK0glQM9"}` |
| Subject | singleLineText |  |
| Grade | singleSelect | `{"choices":[{"id":"selNh9cjbcmXoXT4P","name":"A","color":"blueLight2"},{"id":"seld6GIWdibKs9FPa","name":"B","color":"cyanLight2"},{"id":"selYbTHOnqFuNBXjs","name":"C","color":"tealLight2"},{"id":"selkSdEyoWgKLEV2F","name":"D","color":"greenLight2"},{"id":"selgyuicB4jMWvrXS","name":"F","color":"yellowLight2"}]}` |
| Feedback | multilineText |  |
| Progress Report Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Performance Photo | multipleAttachments | `{"isReversed":true}` |

## Courses

| Field | Type | Options |
|---|---|---|
| Course Name | singleLineText |  |
| Course Duration | number | `{"precision":0}` |
| Syllabus | multilineText |  |
| Schedule | multipleRecordLinks | `{"linkedTableId":"tblXiMEfCxenxGCLq","isReversed":false,"prefersSingleRecordLink":true,"inverseLinkFieldId":"fldrBRtnLlYzB73Ur"}` |
| Instructor | singleLineText |  |
| Institute | multipleRecordLinks | `{"linkedTableId":"tbl1XRPop3NNcAaxF","isReversed":false,"prefersSingleRecordLink":true,"inverseLinkFieldId":"fldUNARrhHlZA7BVk"}` |
| Course Materials | multipleAttachments | `{"isReversed":true}` |
| Attendance Records | multipleRecordLinks | `{"linkedTableId":"tblQQ6TNTxJhV88sl","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldWVnsC7G3JNbKnn"}` |
| Assignments | multipleRecordLinks | `{"linkedTableId":"tbl0tbIWrxn8olVWJ","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldrJ2JjhqSAurRYx"}` |
| Teachers | singleLineText |  |

## Assignments

| Field | Type | Options |
|---|---|---|
| Assignment Title | singleLineText |  |
| Due Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Submission Status | singleSelect | `{"choices":[{"id":"selP0BJ9TNpWYdG63","name":"Not Submitted","color":"blueLight2"},{"id":"selDRj0iL9uqKAgqZ","name":"Submitted","color":"cyanLight2"},{"id":"selLbrp9n6fqtbApo","name":"Graded","color":"tealLight2"}]}` |
| Course | multipleRecordLinks | `{"linkedTableId":"tblTh2jUWSVxg4iUz","isReversed":false,"prefersSingleRecordLink":true,"inverseLinkFieldId":"fldOgSzraJh5ZXEOE"}` |
| Student | multipleRecordLinks | `{"linkedTableId":"tbl1cOkQ1qMbeZgn4","isReversed":false,"prefersSingleRecordLink":true,"inverseLinkFieldId":"fldKi4G3Nb8N5juch"}` |
| Grade | number | `{"precision":2}` |
| Feedback | multilineText |  |

## Attendance Records

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| Attendance Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Student | multipleRecordLinks | `{"linkedTableId":"tbl1cOkQ1qMbeZgn4","isReversed":false,"prefersSingleRecordLink":true,"inverseLinkFieldId":"fldGuc6hmF8PB7SFF"}` |
| Course | multipleRecordLinks | `{"linkedTableId":"tblTh2jUWSVxg4iUz","isReversed":false,"prefersSingleRecordLink":true,"inverseLinkFieldId":"fldBKQdJCaBDBtZVY"}` |
| Presence Status | singleSelect | `{"choices":[{"id":"selzUlqagBiBr07n6","name":"Present","color":"blueLight2"},{"id":"sel4Wp1hZJBNRBV0a","name":"Absent","color":"cyanLight2"},{"id":"selT5zhe6gKeeL4Wu","name":"Tardy","color":"tealLight2"}]}` |
| Excused Absence | checkbox | `{"icon":"thumbsUp","color":"greenBright"}` |
| Notes | multilineText |  |

## Class Schedules

| Field | Type | Options |
|---|---|---|
| Class Name | singleLineText |  |
| Teacher | singleLineText |  |
| Students | multipleRecordLinks | `{"linkedTableId":"tbl1cOkQ1qMbeZgn4","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fld6LrtfyL8sLEucy"}` |
| Start Time | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| End Time | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Location | singleLineText |  |
| Recurring | singleSelect | `{"choices":[{"id":"sell0rmnUws7gH6AC","name":"None","color":"blueLight2"},{"id":"sel89JXPLTawURs64","name":"Daily","color":"cyanLight2"},{"id":"sel1DuFxoTgcmOofG","name":"Weekly","color":"tealLight2"},{"id":"selaRFQUnziQvrX4X","name":"Monthly","color":"greenLight2"}]}` |
| Classroom Resources | multipleSelects | `{"choices":[{"id":"selXhB8SGgyN5hkJp","name":"Projector","color":"blueLight2"},{"id":"selPzuFzzDFy1yEO9","name":"Whiteboard","color":"cyanLight2"},{"id":"selSqleIPhaZEy7Ju","name":"Computer Lab","color":"tealLight2"},{"id":"selrykOpZtIzIt8Pq","name":"Science Lab","color":"greenLight2"}]}` |
| Special Notes | multilineText |  |
| Courses | multipleRecordLinks | `{"linkedTableId":"tblTh2jUWSVxg4iUz","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldgMzQG9bZRCCXt5"}` |

## Booking

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| Grade | singleLineText |  |
| Age | number | `{"precision":0}` |
| Adress | multilineText |  |
| Preferred Days | multipleSelects | `{"choices":[{"id":"selABAlPNT5xS8RIb","name":"Sunday","color":"blueLight2"},{"id":"selBAofuPtutS7a7p","name":"Monday","color":"cyanLight2"},{"id":"selNUMBKomvQ3Jjuc","name":"Tuesday","color":"tealLight2"},{"id":"selmWrHSmafzF8WMS","name":"Wednesday","color":"greenLight2"},{"id":"selDqngXm76MuQZVn","name":"Friday","color":"yellowLight2"},{"id":"selR3HiqzM3MPiNns","name":"Saturday","color":"orangeLight2"}]}` |
| Trial Lesson Date | date | `{"dateFormat":{"name":"european","format":"D/M/YYYY"}}` |
| Phone number | phoneNumber |  |
| Email | email |  |
| Teacher Name | multipleRecordLinks | `{"linkedTableId":"tblyQHaIDP4yP7ppJ","isReversed":false,"prefersSingleRecordLink":true,"inverseLinkFieldId":"fldJcVuAQ7J2uo5li"}` |
| Teacher Name (from Teacher Name) | multipleLookupValues | `{"isValid":true,"recordLinkFieldId":"flddbfA6SEAq5LfEf","fieldIdInLinkedTable":"fldrP4fx1ZtosDXBG","result":{"type":"singleLineText"}}` |

## TestTableScript

| Field | Type | Options |
|---|---|---|
| Column1 | singleLineText |  |
| Column2 | number | `{"precision":0}` |
| NewColumnTest | singleLineText |  |

## Subjects

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| Name Vietnamese | singleLineText |  |
| Icon | singleLineText |  |
| Category | singleSelect | `{"choices":[{"id":"selY2HGd4qboVWt5b","name":"Academic","color":"grayLight2"},{"id":"selSwa6vy8wJw6311","name":"Extracurricular","color":"grayLight2"}]}` |
| Description | multilineText |  |
| Description Vietnamese | multilineText |  |
| Color | singleLineText |  |
| Status | singleSelect | `{"choices":[{"id":"selYkj2nNQjaGaEZZ","name":"Active","color":"grayLight2"},{"id":"selxoAFz0HSRzGz4O","name":"Inactive","color":"grayLight2"}]}` |

## Parents

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| Email | email |  |
| Phone | phoneNumber |  |
| Address | multilineText |  |
| Children | multipleRecordLinks | `{"linkedTableId":"tbl1cOkQ1qMbeZgn4","isReversed":false,"prefersSingleRecordLink":false,"inverseLinkFieldId":"fldFaSNjJkuPgB8ve"}` |
| Payment Method | singleSelect | `{"choices":[{"id":"selbODSECMhm2jQFN","name":"Credit Card","color":"grayLight2"},{"id":"selzTn2yUyBxrCvce","name":"Bank Transfer","color":"grayLight2"},{"id":"selZnTbibRPIEOhgZ","name":"Cash","color":"grayLight2"},{"id":"selEMEfuIJXlDlW5J","name":"Digital Wallet","color":"grayLight2"},{"id":"sel2Aw4yVRM3loHYr","name":"PayPal","color":"grayLight2"}]}` |
| Status | singleSelect | `{"choices":[{"id":"selfZwhv5FPqKRnjf","name":"Active","color":"grayLight2"},{"id":"selCljo8LUpJjjt14","name":"Inactive","color":"grayLight2"}]}` |

## Bookings

| Field | Type | Options |
|---|---|---|
| Student ID | singleLineText |  |
| Teacher ID | singleLineText |  |
| Parent ID | singleLineText |  |
| Subject | singleLineText |  |
| Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Time | singleLineText |  |
| Duration | number | `{"precision":0}` |
| Status | singleSelect | `{"choices":[{"id":"selrqgmf0D6ov6nzZ","name":"Pending","color":"grayLight2"},{"id":"sel36ZCz28tVFDa89","name":"Confirmed","color":"grayLight2"},{"id":"selTpkVrTFdEgRenx","name":"Completed","color":"grayLight2"},{"id":"selzXQyIz97ysbm3p","name":"Cancelled","color":"grayLight2"}]}` |
| Notes | multilineText |  |
| Payment Status | singleSelect | `{"choices":[{"id":"selGHThdfQLlVAFlS","name":"Pending","color":"grayLight2"},{"id":"sel2pFEHOyoHMdSeN","name":"Paid","color":"grayLight2"},{"id":"selguiitgHHfezkao","name":"Refunded","color":"grayLight2"}]}` |
| Created At | dateTime | `{"dateFormat":{"name":"local","format":"l"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"America/New_York"}` |

## Reviews

| Field | Type | Options |
|---|---|---|
| Teacher ID | singleLineText |  |
| Student ID | singleLineText |  |
| Rating | number | `{"precision":1}` |
| Comment | multilineText |  |
| Created At | dateTime | `{"dateFormat":{"name":"local","format":"l"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"America/New_York"}` |

## Payments

| Field | Type | Options |
|---|---|---|
| Booking ID | singleLineText |  |
| Amount | number | `{"precision":0}` |
| Currency | singleLineText |  |
| Status | singleSelect | `{"choices":[{"id":"selp7LdX25gVMPZ3T","name":"Pending","color":"grayLight2"},{"id":"selJcHQRajRugz7GJ","name":"Paid","color":"grayLight2"},{"id":"sel43EJW6azZSGfBP","name":"Refunded","color":"grayLight2"}]}` |
| Payment Method | singleLineText |  |
| Transaction ID | singleLineText |  |
| Created At | dateTime | `{"dateFormat":{"name":"local","format":"l"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"America/New_York"}` |

## Homework

| Field | Type | Options |
|---|---|---|
| Student ID | singleLineText |  |
| Teacher ID | singleLineText |  |
| Subject | singleLineText |  |
| Title | singleLineText |  |
| Description | multilineText |  |
| Due Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Status | singleSelect | `{"choices":[{"id":"selxK4RAE3zUYY5m2","name":"Assigned","color":"grayLight2"},{"id":"seloCznT114nbUcwv","name":"Submitted","color":"grayLight2"},{"id":"selX1QGsZgbTQDfzB","name":"Graded","color":"grayLight2"}]}` |
| Adaptive Level | number | `{"precision":0}` |
| Created At | dateTime | `{"dateFormat":{"name":"local","format":"l"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"America/New_York"}` |

## Posts

| Field | Type | Options |
|---|---|---|
| Author ID | singleLineText |  |
| Author Name | singleLineText |  |
| Author Role | singleSelect | `{"choices":[{"id":"selfG1EckP2btJ7HG","name":"teacher","color":"grayLight2"},{"id":"selRu4uAOywNResM3","name":"parent","color":"grayLight2"},{"id":"selnbErTDzaRDxKnD","name":"student","color":"grayLight2"}]}` |
| Author Avatar | singleLineText |  |
| Content Text | multilineText |  |
| Content Media Type | singleSelect | `{"choices":[{"id":"selVHXyJmG345nZV3","name":"image","color":"grayLight2"},{"id":"seltyBDSCb82eyIDY","name":"video","color":"grayLight2"}]}` |
| Content Media URL | singleLineText |  |
| Content Media Thumbnail | singleLineText |  |
| Post Type | singleSelect | `{"choices":[{"id":"selbYgUOuWhMBPddP","name":"text","color":"grayLight2"},{"id":"seluFMi2IcykIRRbq","name":"image","color":"grayLight2"},{"id":"selk9anzItW4MSyE7","name":"video","color":"grayLight2"},{"id":"selTII4BQBoTrRuVQ","name":"poll","color":"grayLight2"},{"id":"selUoRbDSJnA7DxNV","name":"resource","color":"grayLight2"}]}` |
| Subjects | multipleSelects | `{"choices":[{"id":"selAM7BDvc9kl8uqc","name":"Mathematics","color":"grayLight2"},{"id":"selSElcypiukyRztf","name":"English","color":"grayLight2"},{"id":"selFBX7lOlfpM85LZ","name":"Physics","color":"grayLight2"},{"id":"selM0gH8bxSbFmYBD","name":"Chemistry","color":"grayLight2"},{"id":"sel2Ud8qPLnb9vWGT","name":"Literature","color":"grayLight2"},{"id":"sel537jh7g7Nv9QtH","name":"Biology","color":"grayLight2"},{"id":"selEKSd3uW6NGytAL","name":"History","color":"grayLight2"},{"id":"sel7pCKBC4uokElKA","name":"Geography","color":"grayLight2"},{"id":"sel0iQNXRNV1WLUv2","name":"Computer Science","color":"grayLight2"},{"id":"sela5Q0yuWwGEUy7w","name":"Music","color":"grayLight2"},{"id":"selWY3nKenc8YtJKI","name":"Art","color":"grayLight2"},{"id":"selG9kb4gnJQ1qVn2","name":"Sports","color":"grayLight2"},{"id":"selv7CaagJNdyTmXT","name":"Piano","color":"grayLight2"},{"id":"selGhRArBZ4WEun1q","name":"Guitar","color":"grayLight2"},{"id":"seltaj9aZ5NTRapfL","name":"Swimming","color":"grayLight2"},{"id":"selcPkRi79OkCITl9","name":"Football","color":"grayLight2"},{"id":"selZLnqPyhF2RcphP","name":"Basketball","color":"grayLight2"},{"id":"selTvQ4yU4FgYIQUX","name":"Drawing","color":"grayLight2"},{"id":"sel4TJ0XhAzEzgGEX","name":"Education","color":"grayLight2"},{"id":"selQU2WyVCcHg2sY8","name":"Writing","color":"grayLight2"},{"id":"selqbQK55TUvRHU5T","name":"Creativity","color":"grayLight2"},{"id":"selAu8ZA29vXcEY94","name":"Programming","color":"grayLight2"},{"id":"selHcBEKM2s6vo2KS","name":"Tutoring","color":"grayLight2"}]}` |
| Timestamp | dateTime | `{"dateFormat":{"name":"local","format":"l"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"America/New_York"}` |
| Likes Count | number | `{"precision":0}` |
| Comments Count | number | `{"precision":0}` |
| Shares Count | number | `{"precision":0}` |
| Saves Count | number | `{"precision":0}` |
| Privacy | singleSelect | `{"choices":[{"id":"selAF7EYVle9O0Mpw","name":"public","color":"grayLight2"},{"id":"sellvKvRDE5tlHdyp","name":"center-only","color":"grayLight2"},{"id":"selgzIkY4AdXJGY2e","name":"network-only","color":"grayLight2"}]}` |
| Status | singleSelect | `{"choices":[{"id":"selfyVK8ZDzcU3B3M","name":"Active","color":"grayLight2"},{"id":"selw7WIS2X7leJiii","name":"Hidden","color":"grayLight2"},{"id":"sel2bwxOnXfTmV8zV","name":"Deleted","color":"grayLight2"}]}` |

## TutoTeachers

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| Email | email |  |
| Phone | phoneNumber |  |
| Avatar | singleLineText |  |
| Subjects | multipleSelects | `{"choices":[{"id":"sel1XvbdzaTCqgocL","name":"Mathematics","color":"grayLight2"},{"id":"selBhuVCbX70muOr8","name":"English","color":"grayLight2"},{"id":"seln3FrbPPyg9aMoL","name":"Physics","color":"grayLight2"},{"id":"selcSZvt7en9fFZ9b","name":"Chemistry","color":"grayLight2"},{"id":"selvBWcxv2yFUyH3C","name":"Literature","color":"grayLight2"},{"id":"selQ8V01Ee17ag8np","name":"Biology","color":"grayLight2"},{"id":"selCMemm4MsRt1SpB","name":"History","color":"grayLight2"},{"id":"sellkCC8qGl4ptoVt","name":"Geography","color":"grayLight2"},{"id":"selCZqjNuInF4QFDB","name":"Computer Science","color":"grayLight2"},{"id":"selvXkEINzn94zDXF","name":"Music","color":"grayLight2"},{"id":"sel4Mo9Jd5tOWEeNa","name":"Art","color":"grayLight2"},{"id":"selEvcKx84rIA5fAM","name":"Sports","color":"grayLight2"},{"id":"selI9dhyYc8ySFHGY","name":"Piano","color":"grayLight2"},{"id":"selM7bckopWlBlQgx","name":"Guitar","color":"grayLight2"},{"id":"selvC8E630dRrTd6N","name":"Swimming","color":"grayLight2"},{"id":"selEJlnKAfkzUwRLn","name":"Football","color":"grayLight2"},{"id":"seltGZaoKlliIrRBK","name":"Basketball","color":"grayLight2"},{"id":"selqzXVidq3FWvP2E","name":"Drawing","color":"grayLight2"}]}` |
| Qualifications | multilineText |  |
| Experience | number | `{"precision":0}` |
| Hourly Rate | number | `{"precision":0}` |
| Rating | number | `{"precision":1}` |
| Review Count | number | `{"precision":0}` |
| Location Address | multilineText |  |
| Latitude | number | `{"precision":6}` |
| Longitude | number | `{"precision":6}` |
| Availability Days | multipleSelects | `{"choices":[{"id":"sel8y7INAnOi0pIYw","name":"Monday","color":"grayLight2"},{"id":"sel9W5Pje3VJpTOmn","name":"Tuesday","color":"grayLight2"},{"id":"sel1zJWxEx14Jx7Cv","name":"Wednesday","color":"grayLight2"},{"id":"selHYqB6cHI9wgLai","name":"Thursday","color":"grayLight2"},{"id":"selGrRVNiKYjXnygE","name":"Friday","color":"grayLight2"},{"id":"selFxCrXThNngh2jq","name":"Saturday","color":"grayLight2"},{"id":"selLrSFZ1qMPezVbn","name":"Sunday","color":"grayLight2"}]}` |
| Availability Time Slots | multilineText |  |
| Languages | multipleSelects | `{"choices":[{"id":"selLFcDFoI3K9Aq9D","name":"Vietnamese","color":"grayLight2"},{"id":"selUtC9ZjMbkUNTdx","name":"English","color":"grayLight2"},{"id":"selPOQmHCAaV8LDYV","name":"Chinese","color":"grayLight2"},{"id":"selWlBS4SUc91Zwsd","name":"French","color":"grayLight2"},{"id":"selPp4K2yQXwWdHrM","name":"Korean","color":"grayLight2"},{"id":"selIRd74epi9Ox9kx","name":"Japanese","color":"grayLight2"}]}` |
| Description | multilineText |  |
| Status | singleSelect | `{"choices":[{"id":"selceVqLhpZc0rhIr","name":"Active","color":"grayLight2"},{"id":"selNBGy81aGqSI12p","name":"Inactive","color":"grayLight2"},{"id":"selILIagGoJrTvYLe","name":"Pending","color":"grayLight2"}]}` |
| ID | singleLineText |  |
| Location | singleLineText |  |
| Availability | singleLineText |  |

## TutoStudents

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| Age | number | `{"precision":0}` |
| Grade | singleLineText |  |
| Parent ID | singleLineText |  |
| Subjects of Interest | multipleSelects | `{"choices":[{"id":"seldXURfYFHdoJFfh","name":"Mathematics","color":"grayLight2"},{"id":"selLRlcxYx1W6W6FR","name":"English","color":"grayLight2"},{"id":"sel3foIp9sG9eDQgH","name":"Physics","color":"grayLight2"},{"id":"seluTIigsvuLJuoAh","name":"Chemistry","color":"grayLight2"},{"id":"selvOzMiYssHH0EY3","name":"Literature","color":"grayLight2"},{"id":"selrYfGYHTBsfpecU","name":"Biology","color":"grayLight2"},{"id":"selx1FO4cLLthvcb3","name":"History","color":"grayLight2"},{"id":"selFyxlNQN05qAsaN","name":"Geography","color":"grayLight2"},{"id":"selTIkyIdrRxT0w9B","name":"Computer Science","color":"grayLight2"},{"id":"sel8xnj8j9EMhyjXc","name":"Music","color":"grayLight2"},{"id":"selfnU0jkhEZ7P9B7","name":"Art","color":"grayLight2"},{"id":"selKQLo4uD2ULaNzU","name":"Sports","color":"grayLight2"},{"id":"selzeeG1FiDVmTco1","name":"Piano","color":"grayLight2"},{"id":"sel0MxNYU6wsiLCS3","name":"Guitar","color":"grayLight2"},{"id":"selgSr54s7Uc3uNkQ","name":"Swimming","color":"grayLight2"},{"id":"seliwSvGA82HdcQkZ","name":"Football","color":"grayLight2"},{"id":"seleRePSXGv0QTYYD","name":"Basketball","color":"grayLight2"},{"id":"selG5WdIHRFHDBMwq","name":"Drawing","color":"grayLight2"}]}` |
| Address | multilineText |  |
| Phone | phoneNumber |  |
| Email | email |  |
| Status | singleSelect | `{"choices":[{"id":"selmBPVGg5lCpMFIS","name":"Active","color":"grayLight2"},{"id":"selX3oRhMzJKK85ww","name":"Inactive","color":"grayLight2"}]}` |
| ID | singleLineText |  |

## TutoParents

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| Email | email |  |
| Phone | phoneNumber |  |
| Address | multilineText |  |
| Payment Method | singleSelect | `{"choices":[{"id":"selSyK9YzvudDTyYB","name":"Credit Card","color":"grayLight2"},{"id":"selvemv0huRMNQDGZ","name":"Bank Transfer","color":"grayLight2"},{"id":"selVlXDgJHcs3eLNT","name":"Cash","color":"grayLight2"},{"id":"selsH8taa5UrjOW4i","name":"Digital Wallet","color":"grayLight2"},{"id":"sel1mBVuiGuuiHY2N","name":"PayPal","color":"grayLight2"}]}` |
| Status | singleSelect | `{"choices":[{"id":"selVR80Fjkwz6rOZ5","name":"Active","color":"grayLight2"},{"id":"sel85GtHvchxiu6cm","name":"Inactive","color":"grayLight2"}]}` |
| Password Hash | singleLineText |  |
| ID | singleLineText |  |
| Children | singleLineText |  |

## TutoSubjects

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| Name Vietnamese | singleLineText |  |
| Icon | singleLineText |  |
| Category | singleSelect | `{"choices":[{"id":"selb1upe6uyICc4PT","name":"Academic","color":"grayLight2"},{"id":"selkb3NMMxvGO7Bow","name":"Extracurricular","color":"grayLight2"}]}` |
| Description | multilineText |  |
| Description Vietnamese | multilineText |  |
| Color | singleLineText |  |
| Status | singleSelect | `{"choices":[{"id":"selEOjRI0Ls1B5DAl","name":"Active","color":"grayLight2"},{"id":"seltu4hlb8Ju8MsAg","name":"Inactive","color":"grayLight2"}]}` |
| ID | singleLineText |  |
| Name (Vietnamese) | singleLineText |  |

## TutoBookings

| Field | Type | Options |
|---|---|---|
| Student ID | singleLineText |  |
| Teacher ID | singleLineText |  |
| Parent ID | singleLineText |  |
| Subject | singleLineText |  |
| Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Time | singleLineText |  |
| Duration | number | `{"precision":0}` |
| Status | singleSelect | `{"choices":[{"id":"selCbRbfBrxA4gpxl","name":"Pending","color":"grayLight2"},{"id":"sel3aQuOJcQiTzH4N","name":"Confirmed","color":"grayLight2"},{"id":"selLWkHeJMUrmcYeI","name":"Completed","color":"grayLight2"},{"id":"selIsPLKP8EogvkOm","name":"Cancelled","color":"grayLight2"}]}` |
| Notes | multilineText |  |
| Payment Status | singleSelect | `{"choices":[{"id":"sel9NepXXf1D5nAKo","name":"Pending","color":"grayLight2"},{"id":"selZG3yl0WyYMzPpd","name":"Paid","color":"grayLight2"},{"id":"selS0o8JY9tLGTod0","name":"Refunded","color":"grayLight2"}]}` |
| Created At | dateTime | `{"dateFormat":{"name":"local","format":"l"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"America/New_York"}` |
| ID | singleLineText |  |

## TutoReviews

| Field | Type | Options |
|---|---|---|
| Teacher ID | singleLineText |  |
| Student ID | singleLineText |  |
| Rating | number | `{"precision":1}` |
| Comment | multilineText |  |
| Created At | dateTime | `{"dateFormat":{"name":"local","format":"l"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"America/New_York"}` |
| ID | singleLineText |  |

## TutoPayments

| Field | Type | Options |
|---|---|---|
| Booking ID | singleLineText |  |
| Amount | number | `{"precision":0}` |
| Currency | singleLineText |  |
| Status | singleSelect | `{"choices":[{"id":"selkUAd3t3jgqq7D1","name":"Pending","color":"grayLight2"},{"id":"selNYEVpC6a68a9U5","name":"Paid","color":"grayLight2"},{"id":"sel7LOJLt2JJOteKc","name":"Refunded","color":"grayLight2"}]}` |
| Payment Method | singleLineText |  |
| Transaction ID | singleLineText |  |
| Created At | dateTime | `{"dateFormat":{"name":"local","format":"l"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"America/New_York"}` |
| ID | singleLineText |  |

## TutoHomework

| Field | Type | Options |
|---|---|---|
| Student ID | singleLineText |  |
| Teacher ID | singleLineText |  |
| Subject | singleLineText |  |
| Title | singleLineText |  |
| Description | multilineText |  |
| Due Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Status | singleSelect | `{"choices":[{"id":"selDOC6kFrgxV4Nyh","name":"Assigned","color":"grayLight2"},{"id":"sel6qzCRGlh1SaTLX","name":"Submitted","color":"grayLight2"},{"id":"selcz70RNldep8awe","name":"Graded","color":"grayLight2"}]}` |
| Adaptive Level | number | `{"precision":0}` |
| Created At | dateTime | `{"dateFormat":{"name":"local","format":"l"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"America/New_York"}` |
| ID | singleLineText |  |

## TutoPosts

| Field | Type | Options |
|---|---|---|
| Author ID | singleLineText |  |
| Author Name | singleLineText |  |
| Author Role | singleSelect | `{"choices":[{"id":"selcoRaqVoGuNkjnl","name":"teacher","color":"grayLight2"},{"id":"seleCjShE9aKowJmt","name":"parent","color":"grayLight2"},{"id":"sel8pgCsDGi9BhM0G","name":"student","color":"grayLight2"}]}` |
| Author Avatar | singleLineText |  |
| Content Text | multilineText |  |
| Content Media Type | singleSelect | `{"choices":[{"id":"selUCRUiHwLsIduFm","name":"image","color":"grayLight2"},{"id":"sel1Wzazi8GybWAvR","name":"video","color":"grayLight2"}]}` |
| Content Media URL | singleLineText |  |
| Content Media Thumbnail | singleLineText |  |
| Post Type | singleSelect | `{"choices":[{"id":"selnZouTzeo5c32ML","name":"text","color":"grayLight2"},{"id":"selAFiGarHs3sJeMO","name":"image","color":"grayLight2"},{"id":"selawTnTaTDjRL5jv","name":"video","color":"grayLight2"},{"id":"sel58oPBhuZuLAzRc","name":"poll","color":"grayLight2"},{"id":"selhrHNAC81MRc6gt","name":"resource","color":"grayLight2"}]}` |
| Subjects | multipleSelects | `{"choices":[{"id":"selAtxBNiNeQN3VQU","name":"Mathematics","color":"grayLight2"},{"id":"selSGR9ic1ByxY4YT","name":"English","color":"grayLight2"},{"id":"selahyO3lKEKfPfJF","name":"Physics","color":"grayLight2"},{"id":"selsWWtRvbCK48AeL","name":"Chemistry","color":"grayLight2"},{"id":"selIcAuW5kZAtbd3A","name":"Literature","color":"grayLight2"},{"id":"selmVv3uETsl7eg6T","name":"Biology","color":"grayLight2"},{"id":"selGuxsbw0xiBx5Kv","name":"History","color":"grayLight2"},{"id":"selM2yUd7Y5wt5bet","name":"Geography","color":"grayLight2"},{"id":"selw7KWtq2PmVR2Vg","name":"Computer Science","color":"grayLight2"},{"id":"selZR6uMzIoYR1U9B","name":"Music","color":"grayLight2"},{"id":"selSv1vGXKagDNYk4","name":"Art","color":"grayLight2"},{"id":"selawjfk9XZQUfoSa","name":"Sports","color":"grayLight2"},{"id":"sellU73omK26Qw6xH","name":"Piano","color":"grayLight2"},{"id":"selQXG7mfBQq8grYP","name":"Guitar","color":"grayLight2"},{"id":"selDINe92AHfkvrRp","name":"Swimming","color":"grayLight2"},{"id":"selbTZ88XkuygRIe9","name":"Football","color":"grayLight2"},{"id":"sel2qvmoKLYLqZo8c","name":"Basketball","color":"grayLight2"},{"id":"selsukyS9CdOvEgrj","name":"Drawing","color":"grayLight2"},{"id":"sel5wSdQrxmdkCL12","name":"Education","color":"grayLight2"},{"id":"selDowQvbyH67EvIF","name":"Writing","color":"grayLight2"},{"id":"sel1REFtUAG1s1rnI","name":"Creativity","color":"grayLight2"},{"id":"seliRRFij4hkILsuG","name":"Programming","color":"grayLight2"},{"id":"seldcQcfxv88noZdv","name":"Tutoring","color":"grayLight2"}]}` |
| Timestamp | dateTime | `{"dateFormat":{"name":"local","format":"l"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"America/New_York"}` |
| Likes Count | number | `{"precision":0}` |
| Comments Count | number | `{"precision":0}` |
| Shares Count | number | `{"precision":0}` |
| Saves Count | number | `{"precision":0}` |
| Privacy | singleSelect | `{"choices":[{"id":"selOfMuToLpzsiA3S","name":"public","color":"grayLight2"},{"id":"selNZ9O5ihXXXaSNY","name":"center-only","color":"grayLight2"},{"id":"selY1OwFbUpIa9MxV","name":"network-only","color":"grayLight2"}]}` |
| Status | singleSelect | `{"choices":[{"id":"sel5egZ8OJHZZwOey","name":"Active","color":"grayLight2"},{"id":"selfsQlLAFTGkjgnS","name":"Hidden","color":"grayLight2"},{"id":"selUk8Ol8fo9xf9TE","name":"Deleted","color":"grayLight2"}]}` |
| ID | singleLineText |  |
| Is Liked | checkbox | `{"icon":"check","color":"greenBright"}` |
| Is Saved | checkbox | `{"icon":"check","color":"greenBright"}` |
| Created At | singleLineText |  |

## TutoComments

| Field | Type | Options |
|---|---|---|
| ID | singleLineText |  |
| Post ID | singleLineText |  |
| Author ID | singleLineText |  |
| Author Name | singleLineText |  |
| Content | multilineText |  |
| Created At | dateTime | `{"dateFormat":{"name":"iso","format":"YYYY-MM-DD"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"utc"}` |

## ConsentTemplates

| Field | Type | Options |
|---|---|---|
| Template ID | singleLineText |  |
| Title | singleLineText |  |
| Version | number | `{"precision":0}` |
| Active | checkbox | `{"icon":"check","color":"greenBright"}` |

## Users

| Field | Type | Options |
|---|---|---|
| UID | singleLineText |  |
| Email | email |  |
| Name | singleLineText |  |
| Role | singleSelect | `{"choices":[{"id":"selgBHy2KKJkMYv5o","name":"teacher","color":"grayLight2"},{"id":"selD4UQsNaxuaEuMd","name":"parent","color":"grayLight2"},{"id":"sel8tacO8IUcQhpGP","name":"student","color":"grayLight2"}]}` |
| PhotoURL | singleLineText |  |
| Created At | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## GuardianStudentLinks

| Field | Type | Options |
|---|---|---|
| Guardian UID | singleLineText |  |
| Student ID | singleLineText |  |
| Status | singleSelect | `{"choices":[{"id":"selHeiD1w1SFcL0IL","name":"pending","color":"grayLight2"},{"id":"selQ1JlboTDfJm4fP","name":"approved","color":"grayLight2"},{"id":"seltIkrZajAsQSWJf","name":"revoked","color":"grayLight2"}]}` |
| Method | singleSelect | `{"choices":[{"id":"selqRxGCU87b8q96f","name":"code","color":"grayLight2"},{"id":"seltllBQdXgPnkYfF","name":"qr","color":"grayLight2"},{"id":"selYpsqlI48RxG2Q7","name":"id","color":"grayLight2"}]}` |
| Invite Code | singleLineText |  |
| QR Token | singleLineText |  |
| Created At | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Approved At | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## InviteCodes

| Field | Type | Options |
|---|---|---|
| Code | singleLineText |  |
| Student ID | singleLineText |  |
| Issued By UID | singleLineText |  |
| Expires At | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Used | checkbox | `{"icon":"check","color":"greenBright"}` |
| Used At | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## ConsentRecords

| Field | Type | Options |
|---|---|---|
| Record ID | singleLineText |  |
| Template ID | singleLineText |  |
| Guardian UID | singleLineText |  |
| Student ID | singleLineText |  |
| Signature Path | singleLineText |  |
| Signed At | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Status | singleSelect | `{"choices":[{"id":"selJkFva7JPdG1GBT","name":"signed","color":"grayLight2"},{"id":"selLQArnVsUUNqsyn","name":"revoked","color":"grayLight2"}]}` |

## Providers

| Field | Type | Options |
|---|---|---|
| type | singleLineText |  |
| displayName | singleLineText |  |
| subjects | singleLineText |  |
| priceMin | number | `{"precision":0}` |
| priceMax | number | `{"precision":0}` |
| currency | singleLineText |  |
| rating | number | `{"precision":1}` |
| ratingCount | number | `{"precision":0}` |
| lat | singleLineText |  |
| lng | singleLineText |  |
| addressLine | singleLineText |  |
| city | singleLineText |  |
| district | singleLineText |  |
| modalities.online | checkbox | `{"icon":"check","color":"greenBright"}` |
| modalities.in_person | checkbox | `{"icon":"check","color":"greenBright"}` |
| bio | singleLineText |  |
| photos | singleLineText |  |
| availability | singleLineText |  |
| createdAt | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## StudentProfiles

| Field | Type | Options |
|---|---|---|
| guardianUserId | singleLineText |  |
| fullName | singleLineText |  |
| grade | singleLineText |  |
| yearOfBirth | singleLineText |  |
| notes | singleLineText |  |
| createdAt | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## Favorites

| Field | Type | Options |
|---|---|---|
| userId | singleLineText |  |
| providerId | singleLineText |  |
| createdAt | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoSchools

| Field | Type | Options |
|---|---|---|
| School Name | singleLineText |  |
| School Code | singleLineText |  |
| Address | multilineText |  |
| Phone | phoneNumber |  |
| Email | email |  |
| Website | url |  |
| Principal Name | singleLineText |  |
| Principal Email | email |  |
| Principal Phone | phoneNumber |  |
| School Type | singleSelect | `{"choices":[{"id":"selz1FSIHor3aXrWp","name":"Public","color":"grayLight2"},{"id":"selEhsAGYVXdVwAnn","name":"Private","color":"grayLight2"},{"id":"seljOqw3mbpDTZj0o","name":"International","color":"grayLight2"}]}` |
| Grade Levels | multipleSelects | `{"choices":[{"id":"sel7PkdH8W9jZOFBO","name":"Pre-K","color":"grayLight2"},{"id":"seliwAbZYLuZiVBkl","name":"K","color":"grayLight2"},{"id":"selIP0DbHCjLeHv5S","name":"1","color":"grayLight2"},{"id":"selkJ5E74iWEfhmsv","name":"2","color":"grayLight2"},{"id":"selXpn2XU1p2FLhZ6","name":"3","color":"grayLight2"},{"id":"selKcexs3XLn141AG","name":"4","color":"grayLight2"},{"id":"selHikB1FE8GLbMDP","name":"5","color":"grayLight2"},{"id":"selWeFIHf3teIfkQr","name":"6","color":"grayLight2"},{"id":"selC8dQ7D6sOxSlu0","name":"7","color":"grayLight2"},{"id":"selNy3cg27wX4ykIg","name":"8","color":"grayLight2"},{"id":"sel337i4N5ghLdDC9","name":"9","color":"grayLight2"},{"id":"selttKCqBNTSJVRUH","name":"10","color":"grayLight2"},{"id":"sel7YKblTHDRDgHDB","name":"11","color":"grayLight2"},{"id":"selSBZcNCGrCxzzpz","name":"12","color":"grayLight2"}]}` |
| Student Count | number | `{"precision":0}` |
| Teacher Count | number | `{"precision":0}` |
| Founded Year | number | `{"precision":0}` |
| Status | singleSelect | `{"choices":[{"id":"selktcOME2Hma3ThO","name":"Active","color":"grayLight2"},{"id":"selRf8a4ebhN1gHdq","name":"Inactive","color":"grayLight2"},{"id":"selenzQvNuRHmjU9M","name":"Pending","color":"grayLight2"}]}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Updated Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoSchoolInvitations

| Field | Type | Options |
|---|---|---|
| Invitation Code | singleLineText |  |
| School Name | singleLineText |  |
| Created By | singleLineText |  |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Expiry Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Max Uses | number | `{"precision":0}` |
| Current Uses | number | `{"precision":0}` |
| Status | singleSelect | `{"choices":[{"id":"selVCYgIuazPVV406","name":"Active","color":"grayLight2"},{"id":"selWZOMoO2iwDL6aU","name":"Expired","color":"grayLight2"},{"id":"selE3RmtmhMZtrVOR","name":"Used Up","color":"grayLight2"}]}` |
| Used By | multilineText |  |

## TutoSchoolClasses

| Field | Type | Options |
|---|---|---|
| Class Name | singleLineText |  |
| School Name | singleLineText |  |
| Grade Level | singleLineText |  |
| Academic Year | singleLineText |  |
| Student Count | number | `{"precision":0}` |
| Schedule | multilineText |  |
| Room Number | singleLineText |  |
| Status | singleSelect | `{"choices":[{"id":"selrhNw8GiRInBsG5","name":"Active","color":"grayLight2"},{"id":"sel4ShFcDSaqtC3yb","name":"Inactive","color":"grayLight2"},{"id":"selwXE88E1iRwG4Vg","name":"Completed","color":"grayLight2"}]}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoSchoolStudents

| Field | Type | Options |
|---|---|---|
| Student Name | singleLineText |  |
| School Name | singleLineText |  |
| Class Name | singleLineText |  |
| Student ID | singleLineText |  |
| Date of Birth | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Gender | singleSelect | `{"choices":[{"id":"selo3mEDq8hpwTFyy","name":"Male","color":"grayLight2"},{"id":"selFbift3dUk0fVZL","name":"Female","color":"grayLight2"},{"id":"selq3wYGhb341i8Hr","name":"Other","color":"grayLight2"}]}` |
| Grade Level | singleLineText |  |
| Parent Name | singleLineText |  |
| Parent Email | email |  |
| Parent Phone | phoneNumber |  |
| Address | multilineText |  |
| Emergency Contact | singleLineText |  |
| Emergency Phone | phoneNumber |  |
| Medical Notes | multilineText |  |
| Status | singleSelect | `{"choices":[{"id":"selolIoIzjn2mO4nh","name":"Active","color":"grayLight2"},{"id":"selWNsTXUxHl2ZdOh","name":"Inactive","color":"grayLight2"},{"id":"selQON0lw9WiTgiBr","name":"Graduated","color":"grayLight2"}]}` |
| Enrollment Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoSchoolTeachers

| Field | Type | Options |
|---|---|---|
| Teacher Name | singleLineText |  |
| School Name | singleLineText |  |
| Email | email |  |
| Phone | phoneNumber |  |
| Position | singleLineText |  |
| Subjects | multilineText |  |
| Grade Levels | multilineText |  |
| Experience Years | number | `{"precision":0}` |
| Education | multilineText |  |
| Bio | multilineText |  |
| Status | singleSelect | `{"choices":[{"id":"sel8zKhy1YeAY8lgO","name":"Active","color":"grayLight2"},{"id":"selncXMavWTLgFA7g","name":"Inactive","color":"grayLight2"},{"id":"selZ7lk8TfSmo4JO6","name":"On Leave","color":"grayLight2"}]}` |
| Hire Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoDailyActivities

| Field | Type | Options |
|---|---|---|
| Activity Title | singleLineText |  |
| School Name | singleLineText |  |
| Class Name | singleLineText |  |
| Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Activity Type | singleLineText |  |
| Description | multilineText |  |
| Location | singleLineText |  |
| Start Time | singleLineText |  |
| End Time | singleLineText |  |
| Students Present | multilineText |  |
| Notes | multilineText |  |
| Status | singleSelect | `{"choices":[{"id":"selPt83qoScUhAC3k","name":"Scheduled","color":"grayLight2"},{"id":"selL1JNthVEsOhW9o","name":"In Progress","color":"grayLight2"},{"id":"selhv9lQ5m3PnRW0w","name":"Completed","color":"grayLight2"},{"id":"seltLsGZSWfmAmxLP","name":"Cancelled","color":"grayLight2"}]}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoMessages

| Field | Type | Options |
|---|---|---|
| Message Subject | singleLineText |  |
| School Name | singleLineText |  |
| From User | singleLineText |  |
| From Role | singleLineText |  |
| To User | singleLineText |  |
| To Role | singleLineText |  |
| Message Content | multilineText |  |
| Priority | singleSelect | `{"choices":[{"id":"sel2b4zseigZ0yMcL","name":"Low","color":"grayLight2"},{"id":"selyLmUA2sZ4CUKqr","name":"Normal","color":"grayLight2"},{"id":"sels7x3DMRGRRBFLF","name":"High","color":"grayLight2"},{"id":"selzaPy8vuVZCzuIb","name":"Urgent","color":"grayLight2"}]}` |
| Status | singleSelect | `{"choices":[{"id":"selYJR6UlR5w2YxvI","name":"Sent","color":"grayLight2"},{"id":"sel9fOsvHTgTrzvkO","name":"Delivered","color":"grayLight2"},{"id":"sel43uxGcIKKiTvPk","name":"Read","color":"grayLight2"}]}` |
| Sent Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Read Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoAbsenceRequests

| Field | Type | Options |
|---|---|---|
| Request ID | singleLineText |  |
| School Name | singleLineText |  |
| Student Name | singleLineText |  |
| Parent Name | singleLineText |  |
| Request Type | singleLineText |  |
| Start Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| End Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Reason | multilineText |  |
| Status | singleSelect | `{"choices":[{"id":"selaD7Jlfu7wHmikc","name":"Pending","color":"grayLight2"},{"id":"selAWafeUBAYn0nPS","name":"Approved","color":"grayLight2"},{"id":"selFCHJWDxe9VTs89","name":"Rejected","color":"grayLight2"}]}` |
| Approved By | singleLineText |  |
| Approval Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Notes | multilineText |  |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoAnnouncements

| Field | Type | Options |
|---|---|---|
| Announcement Title | singleLineText |  |
| School Name | singleLineText |  |
| Content | multilineText |  |
| Category | singleLineText |  |
| Target Audience | multilineText |  |
| Priority | singleSelect | `{"choices":[{"id":"selCPAThFzkQPNVH5","name":"Low","color":"grayLight2"},{"id":"selC55o2g4fmRtnLa","name":"Normal","color":"grayLight2"},{"id":"selZ98nzlOzUfN0CW","name":"High","color":"grayLight2"},{"id":"selzSqtWCNxCTwlCq","name":"Urgent","color":"grayLight2"}]}` |
| Publish Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Expiry Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Author | singleLineText |  |
| Status | singleSelect | `{"choices":[{"id":"selJ7n512NF1sbXe7","name":"Draft","color":"grayLight2"},{"id":"selofu6IQYrKSyco1","name":"Published","color":"grayLight2"},{"id":"selebyQOIH7lXs0xP","name":"Archived","color":"grayLight2"}]}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoHealthRecords

| Field | Type | Options |
|---|---|---|
| Record ID | singleLineText |  |
| School Name | singleLineText |  |
| Student Name | singleLineText |  |
| Record Type | singleLineText |  |
| Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Description | multilineText |  |
| Doctor Name | singleLineText |  |
| Hospital/Clinic | singleLineText |  |
| Allergies | multilineText |  |
| Medications | multilineText |  |
| Emergency Contact | singleLineText |  |
| Emergency Phone | phoneNumber |  |
| Notes | multilineText |  |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoMedicineReminders

| Field | Type | Options |
|---|---|---|
| Reminder ID | singleLineText |  |
| School Name | singleLineText |  |
| Student Name | singleLineText |  |
| Medicine Name | singleLineText |  |
| Dosage | singleLineText |  |
| Frequency | singleLineText |  |
| Time | singleLineText |  |
| Start Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| End Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Instructions | multilineText |  |
| Administered By | singleLineText |  |
| Status | singleSelect | `{"choices":[{"id":"selnScZrogsgUhmmF","name":"Active","color":"grayLight2"},{"id":"selUxG1EzESg3qzUI","name":"Completed","color":"grayLight2"},{"id":"sel1Wq7bejH50AJEu","name":"Cancelled","color":"grayLight2"}]}` |
| Notes | multilineText |  |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoPhotoAlbums

| Field | Type | Options |
|---|---|---|
| Album Title | singleLineText |  |
| School Name | singleLineText |  |
| Event Type | singleLineText |  |
| Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Description | multilineText |  |
| Class Name | singleLineText |  |
| Privacy | singleLineText |  |
| Status | singleSelect | `{"choices":[{"id":"selEkzujQpRKXm04V","name":"Active","color":"grayLight2"},{"id":"selOxn47VyZRkkQc7","name":"Archived","color":"grayLight2"}]}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoExtracurricularActivities

| Field | Type | Options |
|---|---|---|
| Activity Name | singleLineText |  |
| School Name | singleLineText |  |
| Activity Type | singleLineText |  |
| Description | multilineText |  |
| Schedule | multilineText |  |
| Location | singleLineText |  |
| Max Students | number | `{"precision":0}` |
| Current Students | number | `{"precision":0}` |
| Grade Levels | multilineText |  |
| Fee | number | `{"precision":0}` |
| Status | singleSelect | `{"choices":[{"id":"sel9PV68ConCdm3ey","name":"Active","color":"grayLight2"},{"id":"selVgxyOnLl263VqM","name":"Inactive","color":"grayLight2"},{"id":"selqSGJU2BoDrbCLr","name":"Full","color":"grayLight2"}]}` |
| Start Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| End Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Name | singleLineText |  |

## TutoSurveys

| Field | Type | Options |
|---|---|---|
| Survey Title | singleLineText |  |
| School Name | singleLineText |  |
| Survey Type | singleLineText |  |
| Description | multilineText |  |
| Questions | multilineText |  |
| Target Audience | multilineText |  |
| Start Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| End Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Responses | multilineText |  |
| Status | singleSelect | `{"choices":[{"id":"selcIDWJ0deuV48YW","name":"Draft","color":"grayLight2"},{"id":"selfa5nvo14uX67R7","name":"Active","color":"grayLight2"},{"id":"selrANLTfmRwct4ZS","name":"Closed","color":"grayLight2"}]}` |
| Created By | singleLineText |  |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoSchoolPayments

| Field | Type | Options |
|---|---|---|
| Payment ID | singleLineText |  |
| School Name | singleLineText |  |
| Student Name | singleLineText |  |
| Parent Name | singleLineText |  |
| Payment Type | singleLineText |  |
| Amount | number | `{"precision":0}` |
| Due Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Payment Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Payment Method | singleLineText |  |
| Status | singleSelect | `{"choices":[{"id":"selB8PajgEvkh7o0N","name":"Pending","color":"grayLight2"},{"id":"selTRH3N3ZvhIkYjc","name":"Paid","color":"grayLight2"},{"id":"selCrue9dPnRx5GCK","name":"Overdue","color":"grayLight2"},{"id":"selWXvYTxN8Inx1gh","name":"Cancelled","color":"grayLight2"}]}` |
| Notes | multilineText |  |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoSubscriptions

| Field | Type | Options |
|---|---|---|
| Subscription ID | singleLineText |  |
| School Name | singleLineText |  |
| Plan Name | singleLineText |  |
| Features | multilineText |  |
| Monthly Price | number | `{"precision":0}` |
| Annual Price | number | `{"precision":0}` |
| Start Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| End Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Status | singleSelect | `{"choices":[{"id":"selnVATLK3Ir4f5cF","name":"Active","color":"grayLight2"},{"id":"selTeui7L36FvYqXx","name":"Inactive","color":"grayLight2"},{"id":"sel1sEjw7epFN6Bow","name":"Expired","color":"grayLight2"}]}` |
| Payment Status | singleLineText |  |
| Next Billing Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Notes | multilineText |  |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoSchoolEvents

| Field | Type | Options |
|---|---|---|
| Event Title | singleLineText |  |
| School Name | singleLineText |  |
| Event Type | singleLineText |  |
| Description | multilineText |  |
| Start Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| End Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Start Time | singleLineText |  |
| End Time | singleLineText |  |
| Location | singleLineText |  |
| Organizer | singleLineText |  |
| Target Audience | multilineText |  |
| Registration Required | singleLineText |  |
| Max Attendees | number | `{"precision":0}` |
| Current Attendees | number | `{"precision":0}` |
| Status | singleSelect | `{"choices":[{"id":"selvKyrSrWPnSMTnQ","name":"Scheduled","color":"grayLight2"},{"id":"seluOxyQmEgf1CIAP","name":"In Progress","color":"grayLight2"},{"id":"selIm5V6AM9hDwyyN","name":"Completed","color":"grayLight2"},{"id":"selUdkJnQOmNV7S5z","name":"Cancelled","color":"grayLight2"}]}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoHomeworkAssignments

| Field | Type | Options |
|---|---|---|
| Assignment Title | singleLineText |  |
| School Name | singleLineText |  |
| Class Name | singleLineText |  |
| Subject | singleLineText |  |
| Description | multilineText |  |
| Due Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Total Students | number | `{"precision":0}` |
| Submitted Count | number | `{"precision":0}` |
| Status | singleSelect | `{"choices":[{"id":"selKPvDMKyhdcxpDU","name":"Active","color":"grayLight2"},{"id":"selFCLkbDPFZ7tZcp","name":"Due","color":"grayLight2"},{"id":"selv7dEBHnKHnqGZU","name":"Completed","color":"grayLight2"}]}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoProgressReports

| Field | Type | Options |
|---|---|---|
| Report ID | singleLineText |  |
| School Name | singleLineText |  |
| Student Name | singleLineText |  |
| Class Name | singleLineText |  |
| Academic Year | singleLineText |  |
| Term | singleLineText |  |
| Subject | singleLineText |  |
| Grade | singleLineText |  |
| Percentage | number | `{"precision":1}` |
| Teacher Comments | multilineText |  |
| Parent Comments | multilineText |  |
| Report Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Status | singleSelect | `{"choices":[{"id":"sel3q6Abkoydrtupw","name":"Draft","color":"grayLight2"},{"id":"selMbVcIrGShhDx1Y","name":"Published","color":"grayLight2"},{"id":"sel9TRMhMIHJGGnF7","name":"Reviewed","color":"grayLight2"}]}` |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoAttendanceRecords

| Field | Type | Options |
|---|---|---|
| Record ID | singleLineText |  |
| School Name | singleLineText |  |
| Class Name | singleLineText |  |
| Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |
| Student Name | singleLineText |  |
| Status | singleSelect | `{"choices":[{"id":"selIHVDjAyCqcWwJD","name":"Present","color":"grayLight2"},{"id":"selhMiAuYWXaWKfGU","name":"Absent","color":"grayLight2"},{"id":"selva9dAqOK7hgmTr","name":"Late","color":"grayLight2"},{"id":"sel9tyTYqMJJer1bF","name":"Excused","color":"grayLight2"}]}` |
| Arrival Time | singleLineText |  |
| Departure Time | singleLineText |  |
| Notes | multilineText |  |
| Recorded By | singleLineText |  |
| Created Date | date | `{"dateFormat":{"name":"local","format":"l"}}` |

## TutoSchoolProgressReports

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| School Name | singleLineText |  |
| Student Name | singleLineText |  |
| Subject | singleLineText |  |
| Grade | singleLineText |  |
| Term | singleLineText |  |
| Percentage | number | `{"precision":1}` |
| Report Date | date | `{"dateFormat":{"name":"iso","format":"YYYY-MM-DD"}}` |

## TutoSchoolProgressSubjects

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| School Name | singleLineText |  |
| Subject | singleLineText |  |
| Current Percentage | number | `{"precision":1}` |
| Previous Percentage | number | `{"precision":1}` |
| Updated At | dateTime | `{"dateFormat":{"name":"iso","format":"YYYY-MM-DD"},"timeFormat":{"name":"24hour","format":"HH:mm"},"timeZone":"Asia/Ho_Chi_Minh"}` |

## TutoClassSubjects

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| School Name | singleLineText |  |
| Class Name | singleLineText |  |
| Subject | singleLineText |  |
| Enabled | number | `{"precision":0}` |

## TutoStudentSubjectOverrides

| Field | Type | Options |
|---|---|---|
| Name | singleLineText |  |
| School Name | singleLineText |  |
| Student Name | singleLineText |  |
| Subject | singleLineText |  |
| Enabled | number | `{"precision":0}` |
