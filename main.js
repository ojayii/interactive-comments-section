let commentsContainer = document.querySelector(".comments-container");
let comments = document.querySelectorAll(".comment");
const defaultAddCommentBtn = document.querySelector("#default-reply>button");

let commentsData = {};

const commentBox = document.createElement("div");
commentBox.setAttribute("class", "add-reply");
commentBox.insertAdjacentHTML(
  "beforeend",
  `<img src="./images/avatars/image-juliusomo.webp">
        <textarea name="" id="" placeholder="Add a comment..."></textarea>
        <button type="submit">Send</button>`
);

const appendCommentBox = (element) => {
  element.insertBefore(commentBox, element.children[1]);
  commentBox.querySelector("textarea").focus();
};

commentsContainer.addEventListener(
  "click",
  (e) => {
    if (e.target.getAttribute("class")?.includes("mutate-btn--reply")) {
      // appendCommentBox(e.target.parentElement.parentElement.parentElement);
      // console.log('appending comment box...');
      // console.log(e.target);
    }
  },
  true
);

const updateLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

// Define the fetchJsonComments function
const fetchJsonComments = async () => {
  try {
    const response = await fetch("./data.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Define the fetchComments function that calls fetchJsonComments
const fetchComments = async () => {
  return await fetchJsonComments();
};

// Call fetchComments and store the result in a globally accessible variable

fetchComments().then((data) => {
  commentsData = data;
  //   console.log(commentsData);

  // const localComments = commentsData;
  const localComments = JSON.parse(localStorage.getItem("localComments"));
  if (!localComments)
    localStorage.setItem("localComments", JSON.stringify(commentsData));

  console.log(localComments);

  const traverse = (arr) => {
    const testClick = () => console.log("testing click...");

    const value = arr?.map((item) => {
      // console.log(item.replies);

      return `<div class="comment" id=${item.id}>
      <div class="main-comment">
        <div class="score-wrapper">
          <button><img src="./images/icon-plus.svg"></button>
          <span class="score">${item.score}</span>
          <button><img src="./images/icon-minus.svg"></button>
        </div>

        <div class="data">
          <div class="user-meta">
            <img class="user-img" src=${item.user.image.webp} alt>
            ${item.isCurrentUser ? '<span class="user-pov">You</span>' : ""}
            <span class="user-name">${item.user.username}</span>
            <span class="comment-time">${item.createdAt}</span>
          </div>
          <p class="comment-text"><strong class="content-replying-to">${item.replyingTo ?? ''}</strong> ${item.content}</p>
        </div>

        <div class="mutate-btns">
          <!-- <input class="mutate-btn mutate-btn--reply" type="radio" name="mutate-btn" id="mutate-btn-3">
          <label class="mutate-btn mutate-btn--reply" for="mutate-btn-3">Reply</label> -->
          <!-- --> 
          ${
            item.isCurrentUser
              ? `<button class="mutate-btn mutate-btn--delete">
            <img src="./images/icon-delete.svg">
            <span>Delete</span>
          </button>
          <button class="mutate-btn mutate-btn--edit">
            <img src="./images/icon-edit.svg">
            <span>Edit</span>
          </button>`
              : `<button class="mutate-btn mutate-btn--reply">
            <img src="./images/icon-reply.svg">
            <span>Reply</span>
          </button>`
          }

        </div>
      </div>
      <!-- <form action="" class="add-reply" id="">
        <img src="./images/avatars/image-juliusomo.webp">
        <textarea name="" id="" placeholder="Add a comment..."></textarea>
        <button type="submit">Send</button>
      </form> -->
      <div class="replies">${traverse(item.replies)}</div>
    </div>`;
    });
    return value.join("");
  };

  const test = traverse(localComments.comments);
  // console.log(typeof test);
  commentsContainer.insertAdjacentHTML("beforeend", test);
  //   console.log(commentsContainer);

  const attachCommentTo = (comment, id, replyingTo) => {
    const newComment = {
      id: Date.now(),
      content: comment,
      createdAt: "1 month ago",
      score: 0,
      user: localComments.currentUser,
      replies: [],
      isCurrentUser: true,
      replyingTo: replyingTo
    };

    (function loop(arr = localComments.comments) {
      if (!id) {
        arr.push(newComment);
        console.log(arr);
        commentsContainer.innerHTML = traverse(localComments.comments);
        localStorage.setItem("localComments", JSON.stringify(localComments));
        return;
      }
      arr.forEach((element) => {
        if (element.id == id) {
          element.replies.push(newComment);
          console.log(element);
          commentsContainer.innerHTML = traverse(localComments.comments);
          localStorage.setItem("localComments", JSON.stringify(localComments));
          return;
        } else {
          loop(element.replies);
        }
      });
    })();
  };

  const addReplyBtnsEvent = () => {
    for (const button of commentsContainer.querySelectorAll(
      ".mutate-btn--reply"
    )) {
      button.addEventListener("click", () => {
        appendCommentBox(button.parentElement.parentElement.parentElement);
      });
    }

    console.log(commentsContainer.querySelectorAll(".mutate-btn--delete"));
    
    for (const button of commentsContainer.querySelectorAll(".mutate-btn--delete")) {
      
    }
  };

  function objFunc(x, y) {
    // return x + y;

    // test1() {
    //   return 'test1'
    // }
  }

  addReplyBtnsEvent();

  defaultAddCommentBtn.addEventListener("click", (e) => {
    if (e.target.previousElementSibling.value) {
      attachCommentTo(e.target.previousElementSibling.value);
      e.target.previousElementSibling.value = "";
      e.target.previousElementSibling.style.outline = "";
      addReplyBtnsEvent();
    } else {
      e.target.previousElementSibling.style.outline = "2px solid red";
      navigator.vibrate([100, 0, 30]);
    }
  });

  commentBox.querySelector("button").addEventListener("click", () => {
    console.log("replying...");
    console.log(commentBox.parentElement.id);
    // console.log(commentBox.parentElement.querySelector(".user-name"));

    const replyingTo = "@" + commentBox.parentElement.querySelector(".user-name").textContent;
    console.log(replyingTo);

    if (commentBox.querySelector("textarea").value) {
      attachCommentTo(
        commentBox.querySelector("textarea").value,
        commentBox.parentElement.id,
        replyingTo       
      );
      commentBox.querySelector("textarea").value = "";
      addReplyBtnsEvent();
      commentBox.querySelector("textarea").style.outline = "";
    } else {
      commentBox.querySelector("textarea").style.outline = "2px solid red";
      navigator.vibrate([200, 50, 30]);
    }
  });

  const scoreWrappers = document.querySelectorAll(".score-wrapper");

  for (const scoreWrapper of scoreWrappers) {

    scoreWrapper.children[0].addEventListener('click', () => {
      scoreWrapper.children[1].textContent = Number(scoreWrapper.children[1].textContent) + 1;

      ;(function loop(arr = localComments.comments) {

        arr.forEach((element) => {
          if (element.id == scoreWrapper.parentElement.parentElement.id) {
            element.score = Number(scoreWrapper.children[1].textContent);
            localStorage.setItem("localComments", JSON.stringify(localComments));
            console.log(element);
            return;
          } else {
            loop(element.replies);
          }
        });
      })();
    })

    scoreWrapper.children[2].addEventListener('click', () => {
      scoreWrapper.children[1].textContent = Number(scoreWrapper.children[1].textContent) - 1;

      ;(function loop(arr = localComments.comments) {

        arr.forEach((element) => {
          if (element.id == scoreWrapper.parentElement.parentElement.id) {
            element.score = Number(scoreWrapper.children[1].textContent);
            localStorage.setItem("localComments", JSON.stringify(localComments));
            console.log(element);
            return;
          } else {
            loop(element.replies);
          }
        });
      })();
    })
  }
  


});
