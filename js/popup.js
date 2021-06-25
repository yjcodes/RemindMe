var reminderList = [];
var expiredList = [];

window.onload = function() {
    var loadedTime = Date();

    chrome.runtime.sendMessage({msg: "handshake",cmd:"handshake", date: loadedTime},
        function (response) {
        });

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.cmd == "sendAll"){
                while (document.getElementById("reminders").firstChild) {
                    document.getElementById("reminders").removeChild(document.getElementById("reminders").firstChild);
                }
                while (document.getElementById("expRems").firstChild) {
                    document.getElementById("expRems").removeChild(document.getElementById("expRems").firstChild);
                }

                reminderList = request.allReminders;
                expiredList = request.expiredReminders;

                var btn;
                for (var i = 0; i < reminderList.length; i++) {
                    var newElement = document.createElement("LI");

                    btn = document.createElement("BUTTON");
                    btn.appendChild(document.createTextNode('x'));

                    btn.id = reminderList[i].date;

                    newElement.appendChild(btn);
                    var newString = reminderList[i].expireDate.split("GMT");
                    newElement.appendChild(document.createTextNode(" " + reminderList[i].msg + " expires at " + newString[0]));
                    document.getElementById("reminders").appendChild(newElement);
                }

                var btn2;
                if(expiredList.length>0) {
                    for (var i = 0; i < expiredList.length; i++) {
                        var newElement = document.createElement("LI");

                        btn2 = document.createElement("BUTTON");
                        btn2.appendChild(document.createTextNode('x'));

                        btn2.id = expiredList[i].date;

                        newElement.appendChild(btn2);
                        var newString = expiredList[i].expireDate.split("GMT");
                        newElement.appendChild(document.createTextNode(" " + expiredList[i].msg + " expired on " + newString[0]));
                        document.getElementById("expRems").appendChild(newElement);
                    }
                }

                document.getElementById("reminders").addEventListener("click", function (e) {
                    if (e.target && (e.target.nodeName == "BUTTON" || e.target.nodeName == "I")) {
                        for(var i = 0; i < reminderList.length; i++){
                            if(reminderList[i].date == e.target.id){
                                reminderList.splice(i,1);
                                document.getElementById("reminders").removeChild(document.getElementById("reminders").childNodes[i]);

                                chrome.runtime.sendMessage({newList: reminderList, cmd:"delete"},
                                    function (response) {
                                    });

                            }
                        }
                    }
                });

                document.getElementById("expRems").addEventListener("click", function (e) {
                    if (e.target && (e.target.nodeName == "BUTTON" || e.target.nodeName == "I")) {
                        for(var i = 0; i < expiredList.length; i++){
                            if(expiredList[i].date == e.target.id){
                                expiredList.splice(i,1);
                                document.getElementById("expRems").removeChild(document.getElementById("expRems").childNodes[i]);

                                chrome.runtime.sendMessage({newExpiredList: expiredList, cmd:"deleteExp"},
                                    function (response) {
                                    });

                            }
                        }
                    }
                });
            }
        }
    );
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('submit').addEventListener('click', function() {

        var newReminder = document.getElementById("reminder").value;
        var expirationTime = document.getElementById("expireTime").value;
        var expDateStr = String(new Date(expirationTime));
        var timeStamp = Date();
        var timeDifference = Date.parse(timeStamp)-Date.parse(expDateStr);

        //validating fields
        if(newReminder == "" && expirationTime == ""){
            alert("Enter a Reminder/DateTime!");
        }else{
            if(newReminder == ""){
                alert("Enter a Reminder!");
            }
            if(expirationTime == ""){
                alert("Enter a DateTime!");
            }
            if(timeDifference >= 0){
                alert("Plan a Reminder for the Future!");
            }
        }
        if(newReminder != "" && expirationTime != "" && timeDifference < 0){
            document.getElementById("reminder").value = "";
            document.getElementById("expireTime").value = "";

            chrome.runtime.sendMessage({msg: newReminder, date: timeStamp, expireDate: expDateStr, cmd: "normal"},
                function (response) {
                });

            chrome.runtime.onMessage.addListener(
                function(request, sender, sendResponse) {
                    if (request.cmd == "refresh") {
                        reminderList = request.allReminders.uniqKey;
                        while (document.getElementById("reminders").firstChild) {
                            document.getElementById("reminders").removeChild(document.getElementById("reminders").firstChild);
                        }
                        var btn;

                        for (var i = 0; i < reminderList.length; i++) {
                            var newElement = document.createElement("LI");

                            btn = document.createElement("BUTTON");
                            btn.appendChild(document.createTextNode('x'));

                            btn.id = reminderList[i].date;

                            newElement.appendChild(btn);
                            var newString = reminderList[i].expireDate.split("GMT");
                            newElement.appendChild(document.createTextNode(" " + reminderList[i].msg + " expires at " + newString[0]));
                            document.getElementById("reminders").appendChild(newElement);
                        }
                    }
                });


        }
    });

    document.getElementById('dismiss').addEventListener('click', function() {
        chrome.runtime.sendMessage({cmd: "dismissAll"},
            function (response) {
                while (document.getElementById("expRems").firstChild) {
                    document.getElementById("expRems").removeChild(document.getElementById("expRems").firstChild);
                }
            });
    });
});
