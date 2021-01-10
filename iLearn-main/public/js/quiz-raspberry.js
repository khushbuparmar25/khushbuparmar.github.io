function check(){
    var c=0;
    var q1=document.quiz.question1.value;
    var q2=document.quiz.question2.value;
    var q3=document.quiz.question3.value;
    var q4=document.quiz.question4.value;
    var q5=document.quiz.question5.value;
    if(q1=="C"){c++}
    if(q2=="A"){c++}
    if(q3=="D"){c++}
    if(q4=="C"){c++}
    if(q5=="D"){c++}
        document.write(c);
}