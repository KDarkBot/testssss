// Firebase 초기화
var firebaseConfig = {
    apiKey: "AIzaSyAXST1zO_7Rzal1nmkS6mcdib2L6LVbHC8",
  authDomain: "chatsystem1-b341f.firebaseapp.com",
  projectId: "chatsystem1-b341f",
  storageBucket: "chatsystem1-b341f.appspot.com",
  messagingSenderId: "111851594752",
  appId: "1:111851594752:web:ab7955b9b052ba907c64e5",
  measurementId: "G-M14RE2SYWG"
};








function displayMessage(message) {
    var messageContainer = document.getElementById("message-container");
    var messageElement = document.createElement("div");

    // 사용자 닉네임 가져오기
    firebase.firestore().collection("users").doc(message.user).get()
        .then(function(userDoc) {
            var nickname = userDoc.data().nickname;
            messageElement.innerHTML = `<span class="message-nickname">${nickname}: </span>${message.text}`;
            messageContainer.appendChild(messageElement);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        })
        .catch(function(error) {
            console.error("사용자 정보 가져오기 실패:", error);
        });
}

  
  
  firebase.initializeApp(firebaseConfig);
  
  // 배경 이미지 변경 이벤트 처리
  const backgroundInput = document.getElementById('background-input');
  var auth = firebase.auth();
  var db = firebase.firestore(); // db 변수 정의
  backgroundInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        // 이미지를 Base64 데이터로 변환하여 배경 이미지로 설정
        document.body.style.backgroundImage = `url('${e.target.result}')`;
     
        // 로컬 스토리지에 배경 이미지 URL 저장
        localStorage.setItem('backgroundImage', e.target.result);
      };
  
      reader.readAsDataURL(file);
    }
  });
  
  // 설정 버튼 클릭 이벤트 처리
  document.getElementById("settings-button").addEventListener("click", function () {
    document.getElementById("chat-container").style.display = "none";
    document.getElementById("settings-container").style.display = "block";
  
    // 현재 사용자 정보 가져오기
    var user = firebase.auth().currentUser;
    if (user) {
      document.getElementById("account-email-input").value = user.email;
      document.getElementById("account-nickname-input").value = user.displayName;
    }
  });
  
  // 설정 취소 버튼 클릭 이벤트 처리
  document.getElementById("cancel-settings-button").addEventListener("click", function () {
    document.getElementById("settings-container").style.display = "none";
    document.getElementById("chat-container").style.display = "block";
    
    // 로컬 스토리지에서 배경 이미지 제거
    localStorage.removeItem('backgroundImage');
  });
  
  // 설정 저장 버튼 클릭 이벤트 처리
  document.getElementById("save-settings-button").addEventListener("click", function () {
    // 현재 사용자 정보 가져오기
    var user = firebase.auth().currentUser;
    if (user) {
      var newNickname = document.getElementById("account-nickname-input").value;
      user
        .updateProfile({
          displayName: newNickname,
        })
        .then(function () {
          // 설정 저장 성공 시 처리할 로직
          console.log("설정 저장 성공");
  
          // 설정 창 닫기
          document.getElementById("settings-container").style.display = "none";
          document.getElementById("chat-container").style.display = "block";
        })
        .catch(function (error) {
          // 설정 저장 실패 시 처리할 로직
          console.error("설정 저장 실패", error);
        });
    }
  });
  
  // Firebase 인증 상태 변경 이벤트 처리
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // 사용자가 로그인한 경우
      document.getElementById("login-container").style.display = "none";
      document.getElementById("chat-container").style.display = "block";
      document.getElementById("message-input").disabled = false;
      document.getElementById("send-button").disabled = false;
      document.getElementById("logout-button").disabled = false;
      document.getElementById("settings-button").disabled = false;
  
      // 메시지 수신 이벤트 처리
      firebase.firestore().collection("messages").orderBy("timestamp").onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === "added") {
            var message = change.doc.data();
            displayMessage(message);
          }
        });
      });
  
      // 로컬 스토리지에서 배경 이미지 가져오기
      var backgroundImage = localStorage.getItem('backgroundImage');
      if (backgroundImage) {
        // 로컬 스토리지에 배경 이미지가 있는 경우, 해당 이미지를 설정
        document.body.style.backgroundImage = `url('${backgroundImage}')`;
      } else {
        // 로컬 스토리지에 배경 이미지가 없는 경우, 기본 배경 이미지를 설정
        document.body.style.backgroundImage = "url('background.jpg')";
      }
    } else {
      // 사용자가 로그아웃한 경우
      document.getElementById("login-container").style.display = "block";
      document.getElementById("chat-container").style.display = "none";
      document.getElementById("message-input").disabled = true;
      document.getElementById("send-button").disabled = true;
      document.getElementById("logout-button").disabled = true;
      document.getElementById("settings-button").disabled = true;
      document.body.style.backgroundImage = "url('background.jpg')";
    }
  });
  
// 메시지 전송 버튼 클릭 이벤트 처리
document.getElementById("send-button").addEventListener("click", function () {
    var messageInput = document.getElementById("message-input");
    var message = messageInput.value.trim(); // 메시지 텍스트에서 앞뒤 공백 제거
  
    var user = firebase.auth().currentUser;
    if (user && message !== "") { // 사용자가 로그인하고 공백이 아닌 경우에만 메시지 전송
      firebase
        .firestore()
        .collection("messages")
        .add({
          text: message,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          user: user.uid,
        })
        .then(function () {
          // 메시지 전송 성공 시 처리할 로직
          messageInput.value = "";
        })
        .catch(function (error) {
          // 메시지 전송 실패 시 처리할 로직
          console.error("메시지 전송 실패", error);
        });
    }else{
        alert('공백은 불가능합니다')
    }
  });
  

// 로그인 버튼 클릭 이벤트 처리
document.getElementById("login-button").addEventListener("click", function() {
    var email = document.getElementById("email-input").value;
    var password = document.getElementById("password-input").value;

    // Firebase 인증 로그인
    auth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            console.log("로그인 성공");
            var user = userCredential.user;
            // 로그인 성공 후 처리 로직 추가
        })
        .catch(function(error) {
            console.error("로그인 실패:", error.code, error.message);
            if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
                alert("잘못된 이메일 또는 비밀번호입니다. 다시 확인해주세요.");
            } else {
                alert("로그인 중 오류가 발생했습니다. 나중에 다시 시도해주세요.");
            }
        });
});

  

  // 로그아웃 버튼 클릭 이벤트 처리
document.getElementById("logout-button").addEventListener("click", function () {
    firebase
      .auth()
      .signOut()
      .then(function () {
        // 로그아웃 성공 시 처리할 로직
        console.log("로그아웃 성공");
      })
      .catch(function (error) {
        // 로그아웃 실패 시 처리할 로직
        console.error("로그아웃 실패", error);
      });
  });

  
// 계정 생성 버튼 클릭 이벤트 처리
document.getElementById("signup-button").addEventListener("click", function() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("signup-container").style.display = "block";
});

// 계정 생성 취소 버튼 클릭 이벤트 처리
document.getElementById("cancel-button").addEventListener("click", function() {
    document.getElementById("login-container").style.display = "block";
    document.getElementById("signup-container").style.display = "none";
});

// 계정 생성 버튼 클릭 이벤트 처리
document.getElementById("create-account-button").addEventListener("click", function() {
    var email = document.getElementById("signup-email-input").value;
    var password = document.getElementById("signup-password-input").value;
    var nickname = document.getElementById("signup-nickname-input").value;
    var messageInput = document.getElementById("message-input"); // messageInput 변수 정의
  
    // Firebase 인증 계정 생성
    auth.createUserWithEmailAndPassword(email, password)
      .then(function(userCredential) {
        // 계정 생성 성공
        console.log("계정 생성 성공");
        document.getElementById("login-container").style.display = "none";
        document.getElementById("signup-container").style.display = "none";
        document.getElementById("chat-container").style.display = "block";
        messageInput.disabled = false;
        document.getElementById("send-button").disabled = false;
  
        // 사용자 닉네임 Firebase Firestore에 저장
        var user = userCredential.user;
        db.collection("users").doc(user.uid).set({
          nickname: nickname
        });
      })
      .catch(function(error) {
        console.error("계정 생성 오류:", error.code, error.message);
        if (error.code === "auth/email-already-in-use") {
          alert("이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.");
        } else if (error.code === "auth/weak-password") {
          alert("비밀번호는 최소 6자 이상이어야 합니다.");
        } else if (error.code === "auth/invalid-email") {
          alert("유효하지 않은 이메일 형식입니다. 올바른 이메일을 입력해주세요.");
        } else if (error.code === "auth/operation-not-allowed") {
          alert("Firebase 프로젝트 설정에서 이메일/비밀번호 인증이 사용으로 설정되어야 합니다.");
        } else {
          alert("계정 생성 중 오류가 발생했습니다. 나중에 다시 시도해주세요.");
        }
      });
  });
  

  // 페이지가 로드될 때 애니메이션 효과 적용
  document.addEventListener("DOMContentLoaded", function() {
    var cards = document.getElementsByClassName("card");
    for (var i = 0; i < cards.length; i++) {
        setTimeout(function(card) {
            card.classList.add("show");
        }, i * 200, cards[i]);
    }
});







// 메시지 입력란에서 엔터 키를 눌렀을 때 처리
document.getElementById("message-input").addEventListener("keydown", function(event) {
  if (event.keyCode === 13) { // 엔터 키 코드: 13
    event.preventDefault(); // 기본 동작(새 줄 추가) 방지

    // 메시지 전송 로직 실행
    var messageInput = document.getElementById("message-input");
    var message = messageInput.value;

    var user = firebase.auth().currentUser;
    if (user && message.trim() !== "") {
      firebase
        .firestore()
        .collection("messages")
        .add({
          text: message,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          user: user.uid,
        })
        .then(function () {
          // 메시지 전송 성공 시 처리할 로직
          messageInput.value = "";
        })
        .catch(function (error) {
          // 메시지 전송 실패 시 처리할 로직
          console.error("메시지 전송 실패", error);
        });
    }
  }
});

// 알림 권한 요청
function requestNotificationPermission() {
  return new Promise(function(resolve, reject) {
    const messaging = firebase.messaging();
    messaging.requestPermission()
      .then(function() {
        console.log("알림 권한 허용됨");
        return messaging.getToken();
      })
      .then(function(token) {
        console.log("토큰:", token);
        resolve(token);
      })
      .catch(function(error) {
        console.error("알림 권한 요청 실패:", error);
        reject(error);
      });
  });
}

// 서비스 워커 등록
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      console.log('서비스 워커 등록 성공:', registration);
      // 알림 권한 요청
      requestNotificationPermission();
    })
    .catch(function(error) {
      console.error('서비스 워커 등록 실패:', error);
    });
}

// 메시지 수신 처리
firebase.messaging().onMessage(function(payload) {
  console.log('새로운 메시지 도착:', payload);
  var notificationTitle = payload.notification.title;
  var notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon
  };

  // 웹 알림 표시
  var notification = new Notification(notificationTitle, notificationOptions);
});






