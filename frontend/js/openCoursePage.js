const mainEl = document.querySelector("main");
const mainErrorToast = document.getElementById("errorPopDown");
mainErrorToast.addEventListener("click", (e) => {
    mainErrorToast.classList.remove("slideDown");
});

window.addEventListener("load", (e) => {loadMain()});

function loadMain() {
    const courseJSONString = localStorage.getItem("passit-openCourse");
    const USER_INFO_STR = localStorage.getItem("user_info");
    if (!courseJSONString) {
        mainErrorToast.textContent = "There was an error loading the content. Please try returning to the dashboard."
        mainErrorToast.classList.add("slideDown");
        return;
    }

    if (!USER_INFO_STR) {
        mainErrorToast.textContent = "Failed to verify user. Please login again."
        mainErrorToast.classList.add("slideDown");
        return;
    }

    const COURSE_DATA = JSON.parse(courseJSONString);
    document.getElementById("pageTitle").textContent = COURSE_DATA["course_name"];
    document.getElementById("courseHeader").textContent = COURSE_DATA["course_name"];
    document.getElementById("welcomeMsgCourseName").textContent = COURSE_DATA["course_name"];
    document.getElementById("courseSummary").textContent = COURSE_DATA["summary"];

    const CURRENT_WEEK = COURSE_DATA["current_week"];
    const currentWeekTopics = COURSE_DATA["schedule"][CURRENT_WEEK-1]["topics"];
    let topicStr = `Week ${CURRENT_WEEK}: `;
    for (let i=0; i<currentWeekTopics.length; i++) {
        const topic = currentWeekTopics[i];
        let str = topic;
        if (i > 0) {
            str = ", " + topic;
        } else if (i == currentWeekTopics.length - 1) {
            str += ", and " + topic;
        }
        topicStr += str;
    }
    document.getElementById("courseTopicAnnoucement").textContent = topicStr;
    document.getElementById("courseAssignmentReminder").textContent =  `Week ${CURRENT_WEEK}: Don't forget to do your assignments this week!`

    document.getElementById("scheduleBtn").addEventListener("click", (e) => {
        // Schedule modal 
        const dialog = document.createElement("dialog");
        const scheduleSection = document.createElement("section");
        for (const schedule of COURSE_DATA["schedule"]) {
            let html = `
                <article class="spaced-1 outlined padded-1 rise-hover shadow-hover">
                    <h3 class="highlight highlight-dark">${schedule["week"]}</h3> 
                    <p>Goals: ${schedule["goals"]}</p>
                    <div class="spaced-1">
                    <strong>Topics:</strong>
            `;
            let topicList = "<ul class='ulShow ulIndent'>";
            for (const topic of schedule["topics"]) {
                topicList += `<li>${topic}</li>`
            }
            topicList += "</ul></div>";
            html += topicList;
            html += "</article>"
            scheduleSection.innerHTML += html;
        }
        dialog.innerHTML = `
            <header class="dialogHeader">
                <h2>Schedule</h2>
                <button id="closeModalBtn" class="button-1 button-2 rise-hover">✖️</button>
            </header>
            ${scheduleSection.innerHTML}
        `;
        dialog.querySelector("#closeModalBtn").addEventListener("click", (e) => {
            dialog.close();
            document.body.removeChild(dialog);
        });
        document.body.appendChild(dialog);
        dialog.showModal();
    });

    document.getElementById("lessonsBtn").addEventListener("click", (e) => {
        const dialog = document.createElement("dialog");
        const CURRENT_WEEK = COURSE_DATA["current_week"];
        const lessons = COURSE_DATA["schedule"][CURRENT_WEEK-1]["lesson"];

        // Accordion
        const accordionArticle = document.createElement("article");
        let i=0;
        for (const [name, content] of Object.entries(lessons)) {
            const btn = document.createElement("button");
            const lessonP = document.createElement("p");
            lessonP.innerHTML = content;
            btn.textContent = `Lesson ${i}: ${name}`;
            btn.addEventListener("click", (e) => {
                lessonP.classList.toggle("accordionSec--open");
            });
            btn.classList.add("button-1");
            btn.classList.add("button-2");
            btn.classList.add("accordionBtn");
            btn.classList.add("lin-grad-hover");
            accordionArticle.appendChild(btn);
            accordionArticle.appendChild(lessonP);
            lessonP.classList.add("accordionSec");
            lessonP.classList.add("line-spaced-1");
            lessonP.style.paddingInline = "1rem";
            i++;
        }

        dialog.innerHTML = `
            <header class="dialogHeader">
                <div>
                    <h2>Lessons</h2>
                    <hr>
                    <h3 class="highlight-dark">Week ${CURRENT_WEEK}</h3>
                </div>
                <button id="closeModalBtn" class="button-1 button-2 rise-hover">✖️</button>
            </header>
        `;
        dialog.querySelector("#closeModalBtn").addEventListener("click", (e) => {
            dialog.close();
            document.body.removeChild(dialog);
        });
        dialog.appendChild(accordionArticle);
        document.body.appendChild(dialog);
        dialog.showModal();
    });

    document.getElementById("resourcesBtn").addEventListener("click", (e) => {
        const dialog = document.createElement("dialog");

        let html = "";
        const resources = COURSE_DATA["resources"];
        for (const [name, link] of Object.entries(resources)) {
            html += `<li class="link-1"><a href=${link} target="_blank">${name}</a></li>`;
        }
        dialog.innerHTML = `
            <header class="dialogHeader">
                <div>
                    <h2>Resources</h2>
                    <hr>
                </div>
                <button id="closeModalBtn" class="button-1 button-2 rise-hover">✖️</button>
            </header>
            <ul class="ulShow">
                ${html}
            </ul>
        `;
        dialog.querySelector("#closeModalBtn").addEventListener("click", (e) => {
            dialog.close();
            document.body.removeChild(dialog);
        });
        document.body.appendChild(dialog);
        dialog.showModal();
    });

    document.getElementById("practiceBtn").addEventListener("click", (e) => {
        const dialog = document.createElement("dialog");
        dialog.innerHTML = `
            <header class="dialogHeader">
                <div>
                    <h2>Practice</h2>
                    <hr>
                </div>
                <button id="closeModalBtn" class="button-1 button-2 rise-hover">✖️</button>
            </header>
        `;
        dialog.querySelector("#closeModalBtn").addEventListener("click", (e) => {
            dialog.close();
            document.body.removeChild(dialog);
        });

        const CURRENT_WEEK = COURSE_DATA["current_week"];
        const practiceQsArticle = document.createElement("article");
        for (const QA of COURSE_DATA["schedule"][CURRENT_WEEK-1]["assignment"]) {
            const Q = QA["Q"];
            const A = QA["A"];
            const sectionMain = document.createElement("section");

            sectionMain.innerHTML = `
                <div>
                    <p>${Q}</p>
                </div>
                <section>
                </section>
            `;
            const innerSec = sectionMain.querySelector("section");
            const btn = document.createElement("button");
            btn.classList.add("button-1");
            btn.classList.add("button-2");
            btn.classList.add("accordionBtn");
            btn.classList.add("accordionBtnSmall");
            btn.classList.add("lin-grad-hover");
            btn.textContent = "Reveal Answer";
            const answerP = document.createElement("p");
            answerP.innerHTML = "✅ " + A;
            answerP.classList.add("accordionSec");
            btn.addEventListener("click", (e) => {
                answerP.classList.toggle("accordionSec--open");
            });
            innerSec.appendChild(btn);
            innerSec.appendChild(answerP);

            sectionMain.classList.add("outlined");
            sectionMain.classList.add("padded-1");
            sectionMain.classList.add("spaced-1");
            sectionMain.classList.add("rise-hover");
            sectionMain.classList.add("shadow-hover");
            practiceQsArticle.appendChild(sectionMain);
        }

        dialog.appendChild(practiceQsArticle);

        document.body.appendChild(dialog);
        dialog.showModal();
    });
    
}



window.addEventListener("visibilitychange", (e) => {
    console.log("Logout timer set.")
	const timeout = setTimeout(() => {
			localStorage.removeItem("user_info");
            localStorage.removeItem("passit-openCourse");
			console.log("Logged out.");
			window.location.replace("./login_page.html"); // Takes back to login page
		}, 1000*60*5); // Logout after five minutes of not being on page
	if (document.visibilityState !== "hidden") {
        console.log("Logout timer cleared.");
		clearTimeout(timeout);
	}
});