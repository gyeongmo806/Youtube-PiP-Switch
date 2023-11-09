var videoElement = null;
let isPiPActive = false;
let userClose = false;
let setTimer = false;
var modalTimeout;

// 비디오 엘리먼트 선택
videoElement = document.querySelector(
	"#movie_player > div.html5-video-container > video",
);
addScrollEventListener();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message === "url_updated") {
		// const newUrl = message.newUrl;
		console.log("받은 URL 변경 메시지:", request.url);
		// PiP 모드 활성 여부
		// 여기에서 URL 변경에 따른 작업을 수행할 수 있습니다.
		videoElement = document.querySelector(
			"#movie_player > div.html5-video-container > video",
		);
		addScrollEventListener();
	}
});

function addScrollEventListener() {
	if (videoElement) {
		// 페이지 스크롤 이벤트 처리
		window.addEventListener("scroll", () => {
			if (
				document.pictureInPictureElement !== videoElement &&
				isPiPActive
			) {
				console.log("사용자가 직접 PiP 종료");
				isPiPActive = false;
				userClose = true;
			}

			// 현재 스크롤 위치 확인
			const scrollTop =
				window.scrollY || document.documentElement.scrollTop;

			// 비디오 엘리먼트의 현재 위치 확인
			const videoRect = videoElement.getBoundingClientRect();
			// console.log(videoRect.height / 2, videoRect.bottom, userClose);
			if (scrollTop === 0 || videoRect.height / 2 < videoRect.bottom) {
				// 최상단으로 스크롤이 이동하면 PiP 모드 해제
				clearTimeout(modalTimeout);
				setTimer = false;
				hideModal();
				userClose = false;
				if (
					isPiPActive &&
					document.pictureInPictureElement === videoElement
				) {
					togglePiP();
				}
			} else if (videoRect.bottom < 0) {
				if (!isPiPActive && !userClose && !setTimer) {
					showModal();
					setTimer = true;
					modalTimeout = setTimeout(modalTimer, 4000);
					console.log(modalTimeout);
				}
			}
		});
	}
}

function modalTimer() {
	hideModal();
	userClose = true;
}

const modalStyle = document.createElement("style");
modalStyle.textContent = `
  .modal-container {
    position: fixed;
    top: 50%;
    left: 45%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    padding: 20px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
    border-radius: 20px;
    z-index: 9999;
    opacity: 0;
    transform: translateY(50px); 
    transition: opacity 0.3s ease, transform 0.3s ease; 
  }
  .modal-container.show {
    opacity: 1; 
    transform: translateY(0); 
  }
  .modal-title {
    font-size: 18px;
    margin-bottom: 10px;
  }
  .button-container {
    text-align: center;
  }
  .modal-button {
    background-color: #007BFF;
    color: #fff;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
    border: none;
    font-weight: 500;
  }
  .modal-button:hover {
      opacity:0.6;
      transition: 0.1s;
  }

  .close {
    background-color: #A4A4A4;
  }
`;

// 모달 HTML
const modalHTML = `
  <div class="modal-container">
    <p class="modal-title">PiP 모드를 실행하겠습니까?</p>
    <div class="button-container">
        <button class="modal-button confirm" id="confirmButton">실행</button>
        <button class="modal-button close" id="closeButton">닫기</button>
    </div>
  </div>
`;

// 모달 HTML과 스타일을 페이지에 추가
document.body.insertAdjacentHTML("beforeend", modalHTML);
document.head.appendChild(modalStyle);

const modal = document.querySelector(".modal-container");
modal.addEventListener("mousemove", () => {
	console.log(modalTimeout);
	clearTimeout(modalTimeout);
	setTimer = false;
});

modal.addEventListener("mouseleave", () => {
	clearTimeout(modalTimeout);
	setTimer = false;
	modalTimeout = setTimeout(modalTimer, 1000);
});

function showModal() {
	modal.classList.add("show");
}

function hideModal() {
	modal.classList.remove("show");
}

// 확인 버튼 클릭 이벤트 처리
const confirmButton = document.getElementById("confirmButton");
confirmButton.addEventListener("click", () => {
	hideModal();
	togglePiP();
	clearTimeout(modalTimeout);
	setTimer = false;
});

// 취소 버튼 클릭 이벤트 처리
const closeButton = document.getElementById("closeButton");
closeButton.addEventListener("click", () => {
	hideModal();
	userClose = true;
	console.log("User Close");
	clearTimeout(modalTimeout);
	setTimer = false;
});

// PiP 모드 토글 함수
function togglePiP() {
	if (document.pictureInPictureElement === videoElement) {
		document
			.exitPictureInPicture()
			.then(() => {
				isPiPActive = false;
			})
			.catch((error) => {
				console.error("PiP 모드 해제 실패: ", error);
			});
	} else {
		videoElement
			.requestPictureInPicture()
			.then(() => {
				isPiPActive = true;
			})
			.catch((error) => {
				console.error("PiP 모드로 전환 실패: ", error);
			});
	}
}
