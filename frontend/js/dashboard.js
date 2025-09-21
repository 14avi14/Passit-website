// Load in the user 
const MAIN_URL = "https://passit-website.onrender.com";
let USER_INFO = localStorage.getItem("passit-user_info");
if (!USER_INFO) {
	document.body.querySelectorAll(":not(#errorPopDown)").forEach(el => {
		el.innerHTML = "";
	})
	document.getElementById("errorPopDown").textContent = "Oops, an error occured. Please try logging in again.";
	document.getElementById("errorPopDown").classList.add("slideDown");
} else {
	USER_INFO = JSON.parse(USER_INFO);
	displayAllCourseCards(USER_INFO);
}

// Error element animation
document.getElementById("errorPopDown").addEventListener("click", (e) => {
	document.getElementById("errorPopDown").classList.remove("slideDown");
});

async function displayAllCourseCards(USER_INFO) {
	const endpoint = MAIN_URL + `/courses/get_courses?username=${USER_INFO["username"]}`;
	const headers = {
		"login-key": USER_INFO["login-key"]
	};
	document.querySelector(".loading-screen").classList.remove("loading-screen-hidden");
	const courses_info = await fetch(endpoint, {method: "GET", headers: headers}).then(response => {return response.json()});
	for (const data of courses_info) {
		const card = createCourseCard(data, USER_INFO);
		document.querySelector(".cardContainer").appendChild(card)
	}
	document.querySelector(".loading-screen").classList.add("loading-screen-hidden");
}

window.addEventListener("visibilitychange", (e) => {
	const timeout = setTimeout(() => {
			localStorage.removeItem("user_info");
			window.location.replace("../index.html"); // Takes back to login page
		}, 1000*60*5); // Logout after five minutes not on page
	if (document.visibilityState !== "hidden") {
		clearTimeout(timeout);
	}
});

addCourseBtn = document.getElementById("addCourseBtn");
addCourseDialog = document.getElementById("addCourseDialog");
addCourseForm = document.getElementById("addCourseForm");

courseFormError = document.getElementById("courseFormError");

addCourseBtn.addEventListener("click", (e) => {
	addCourseDialog.showModal();
});

document.getElementById("cancelCourseGenerationBtn").addEventListener("click", (e) => {
	addCourseDialog.close();
});


const courseFormErrorChecks = {
	"course_name": (name) => !name,
	"weeks": (length) => !length || length < 1 || length > 20 || Math.floor(length) != length,
}

addCourseForm.addEventListener("submit", (e) => {
	e.preventDefault();
	// Form verification
	const formData = new FormData(addCourseForm);
	const data = Object.fromEntries(formData);

	let errors = false;

	for (const [key, val] of Object.entries(data)) {
		if (key in courseFormErrorChecks) {
			if (courseFormErrorChecks[key](val)) {
				document.getElementById(key+"-error").classList.remove("error--hidden");
				errors = true;
			}
			else {
				document.getElementById(key+"-error").classList.add("error--hidden");
				
			}
		} 
	}

	if (!errors) {
		data["paid"] = !!data["paid"]; // Turn into boolean
		handleCourseCreation(data, USER_INFO);
		addCourseForm.reset();
		addCourseDialog.close();
	}
});


async function makeCourseCreationRequest(userData, verification_info) {
	// username, courseName, weeks, paid are the keys we are looking for
	const endpoint_vars = ["course_name", "weeks", "paid"]
	let endpoint = MAIN_URL + "/courses/get_course_prep_info?";
	userData["paid"] = false;
	for (const key of endpoint_vars) {
		endpoint += `${key}=${userData[key]}&`;
	}
	endpoint += `username=${verification_info["username"]}`;
	console.log(endpoint);
	const headers = {
		"login-key": verification_info["login-key"]
	}
	const data = await fetch(endpoint, {method: "GET", headers: headers}).then(
	(response) => {
		return response.json();
	}).then((data) => {
		return data;
	}).catch(e => {
		document.querySelector(".loading-screen").classList.add("loading-screen-hidden"); // Loading animation end
		document.getElementById("errorPopDown").classList.add("slideDown");
		document.getElementById("errorPopDown").textContent = "Internal Error: Please try again.";
		console.log("ERROR CAUGHT: ", e);
	});
	return data;
}

async function handleCourseCreation(userData, verification_info) {	
	document.querySelector(".loading-screen").classList.remove("loading-screen-hidden"); // Loading animation start
	const request_data = await makeCourseCreationRequest(userData, verification_info);
	const newCard = createCourseCard(request_data, verification_info);
	document.querySelector(".cardContainer").appendChild(newCard);
	document.querySelector(".loading-screen").classList.add("loading-screen-hidden"); // Loading animation end
}


function createCourseCard(data, verification_info) {
	const newCard = document.createElement("article");
	const imagesRoot = "../images/";
	const imageLinks = [
		"classroom_img1.jpg",
		"classroom_img2.jpg",
		"classroom_img3.jpg",
		"classroom_img4.jpg",
	]
	const imageIndex = Math.floor(Math.random() * imageLinks.length);
	const imageLink = imagesRoot + imageLinks[imageIndex];
	let display_course_name = data["course_name"];
	if (data["course_name"].length >= 16) {
		display_course_name = data["course_name"].slice(0, 16) + "..."
	}
	newCard.innerHTML = `
		<img src="${imageLink}" alt=""></img>
		<section>
			<!-- Text -->
			<header class="cardHeader">
				<h2>${display_course_name}</h2>
			</header>
			<p class="highlight">Week ${data["current_week"]}</p>
			<button class="button-1 button-2 rise-hover card-del-btn">Delete</button>
		</section>
	`;
	newCard.querySelector(".card-del-btn").addEventListener("click", async (e) => {
		fetch(MAIN_URL + `/courses/delete_course?course_name=${data["course_name"]}&username=${verification_info["username"]}`, {
			method: "DELETE", 
			headers: {"login-key": verification_info["login-key"]}
		})
		newCard.parentNode.removeChild(newCard);
	});
	newCard.addEventListener("click", async (e) => {
			if (e.target == newCard.querySelector(".card-del-btn")) {
				return;
			}
			const allCourseInfo = await fetch(MAIN_URL + `/courses/get_course_prep_info?course_name=${data["course_name"]}&weeks=0&username=${verification_info["username"]}`, { method: "GET", headers: {"login-key": verification_info["login-key"]}});
			const courseInfoJSON = await allCourseInfo.json();
			localStorage.setItem("passit-openCourse", JSON.stringify(courseInfoJSON));
			window.location.replace("./openCoursePage.html");
		});
	newCard.classList.add("card");
	newCard.classList.add("rise-hover");
	return newCard;
}