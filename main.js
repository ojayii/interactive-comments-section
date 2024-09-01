let commentsContainer = document.querySelector(".comments-container");
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

function showConfirmModal() {
  return new Promise((resolve) => {
    const modal = document.querySelector(".prompt-modal");
    const cancelBtn = modal.querySelector(".cancel");
    const deleteBtn = modal.querySelector(".delete");

    modal.style.display = "flex";

    cancelBtn.addEventListener(
      "click",
      () => {
        modal.style.display = "none";
        resolve(false);
      },
      { once: true }
    );

    deleteBtn.addEventListener(
      "click",
      () => {
        modal.style.display = "none";
        resolve(true);
      },
      { once: true }
    );
  });
}

const fetchJsonComments = async () => {
  try {
    const response = await fetch("./data.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const fetchComments = async () => {
  return await fetchJsonComments();
};

fetchComments().then((data) => {
  commentsData = data;
  let localComments =
    JSON.parse(localStorage.getItem("localComments")) || commentsData;

  const getTimePassed = (timestamp) => {
    const now = Date.now();
    const difference = Math.floor((now - timestamp) / 1000);

    const timeUnits = [
      { unit: "year", value: 31536000 },
      { unit: "month", value: 2592000 },
      { unit: "week", value: 604800 },
      { unit: "day", value: 86400 },
      { unit: "hour", value: 3600 },
      { unit: "minute", value: 60 },
      { unit: "second", value: 1 },
    ];

    for (const { unit, value } of timeUnits) {
      const amount = Math.floor(difference / value);
      if (amount >= 1) {
        return `${amount} ${unit}${amount > 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  };

  const traverse = (arr) => {
    const value = arr?.map((item) => {
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
            <span class="comment-time">${getTimePassed(item.createdAt)}</span>
          </div>
          <p class="comment-text"><strong class="content-replying-to">${
            item.replyingTo ?? ""
          }</strong> <span class= "comment-text--main">${
        item.content
      }</span></p>
        </div>

        <div class="mutate-btns">
          <!-- <input class="mutate-btn mutate-btn--reply" type="radio" name="mutate-btn" id="mutate-btn-3">
          <label class="mutate-btn mutate-btn--reply" for="mutate-btn-3">Reply</label> -->
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

  const arrComments = traverse(localComments.comments);
  commentsContainer.insertAdjacentHTML("beforeend", arrComments);

  const attachCommentTo = (comment, id, replyingTo) => {
    const newComment = {
      id: Date.now(),
      content: comment,
      score: 0,
      createdAt: Date.now(),
      user: localComments.currentUser,
      replies: [],
      isCurrentUser: true,
      replyingTo: replyingTo,
    };

    (function loop(arr = localComments.comments) {
      if (!id) {
        arr.push(newComment);
        commentsContainer.innerHTML = traverse(localComments.comments);
        localStorage.setItem("localComments", JSON.stringify(localComments));
        return;
      }
      arr.forEach((element) => {
        if (element.id == id) {
          element.replies.push(newComment);
          commentsContainer.innerHTML = traverse(localComments.comments);
          localStorage.setItem("localComments", JSON.stringify(localComments));
          return;
        } else {
          loop(element.replies);
        }
      });
    })();
  };

  const addeventHandlers = () => {
    for (const button of commentsContainer.querySelectorAll(
      ".mutate-btn--reply"
    )) {
      button.addEventListener("click", () => {
        commentBox.querySelector("button").onclick = () => {
          const replyingTo =
            "@" +
            commentBox.parentElement.querySelector(".user-name").textContent;

          if (commentBox.querySelector("textarea").value) {
            attachCommentTo(
              commentBox.querySelector("textarea").value,
              commentBox.parentElement.id,
              replyingTo
            );
            commentBox.querySelector("textarea").value = "";
            addeventHandlers();
            commentBox.querySelector("textarea").style.outline = "";
          } else {
            commentBox.querySelector("textarea").style.outline =
              "2px solid red";
            navigator.vibrate([100, 0, 30]);
          }
        };

        commentBox.querySelector("textarea").value = "";
        commentBox.querySelector("button").textContent = "Send";

        appendCommentBox(button.parentElement.parentElement.parentElement);
      });
    }

    for (const button of commentsContainer.querySelectorAll(
      ".mutate-btn--edit"
    )) {
      button.addEventListener("click", () => {
        appendCommentBox(button.parentElement.parentElement.parentElement);
        button.parentElement.parentElement.parentElement.querySelector(
          "textarea"
        ).value =
          button.parentElement.parentElement.parentElement.querySelector(
            ".comment-text--main"
          ).textContent;
        button.parentElement.parentElement.parentElement.querySelector(
          "textarea"
        ).style.outline = "";
        button.parentElement.parentElement.parentElement.querySelector(
          ".add-reply>button"
        ).textContent = "Update";
        button.parentElement.parentElement.parentElement.querySelector(
          ".add-reply>button"
        ).onclick = (e) => {
          (function loop(arr = localComments.comments) {
            arr.forEach((element) => {
              if (element.id == e.target.parentElement.parentElement.id) {
                element.content = e.target.previousElementSibling.value;
                commentsContainer.innerHTML = traverse(localComments.comments);
                localStorage.setItem(
                  "localComments",
                  JSON.stringify(localComments)
                );
                return;
              } else {
                loop(element.replies);
              }
            });
          })();
          addeventHandlers();
        };
      });
    }

    for (const button of commentsContainer.querySelectorAll(
      ".mutate-btn--delete"
    )) {
      button.addEventListener("click", async (e) => {
        const userConfirmed = await showConfirmModal();
        if (userConfirmed) {
          (function loop(arr = localComments.comments) {
            for (const comment of arr) {
              if (
                comment.id ==
                e.target.parentElement.parentElement.parentElement.parentElement
                  .id
              ) {
                tempArr = arr.filter((item) => item.id != comment.id);
                arr.length = 0;
                arr.push(...tempArr);
                console.log(localComments.comments);
                commentsContainer.innerHTML = traverse(localComments.comments);
                localStorage.setItem(
                  "localComments",
                  JSON.stringify(localComments)
                );
              } else {
                loop(comment.replies);
              }
            }
          })();
          addeventHandlers();
        }
      });
    }

    const scoreWrappers = document.querySelectorAll(".score-wrapper");
    for (const scoreWrapper of scoreWrappers) {
      scoreWrapper.children[0].addEventListener("click", () => {
        scoreWrapper.children[1].textContent =
          Number(scoreWrapper.children[1].textContent) + 1;

        (function loop(arr = localComments.comments) {
          arr.forEach((element) => {
            if (element.id == scoreWrapper.parentElement.parentElement.id) {
              element.score = Number(scoreWrapper.children[1].textContent);
              localStorage.setItem(
                "localComments",
                JSON.stringify(localComments)
              );
              return;
            } else {
              loop(element.replies);
            }
          });
        })();
      });

      scoreWrapper.children[2].addEventListener("click", () => {
        if (Number(scoreWrapper.children[1].textContent) > 0) {
          scoreWrapper.children[1].textContent =
            Number(scoreWrapper.children[1].textContent) - 1;

          (function loop(arr = localComments.comments) {
            arr.forEach((element) => {
              if (element.id == scoreWrapper.parentElement.parentElement.id) {
                element.score = Number(scoreWrapper.children[1].textContent);
                localStorage.setItem(
                  "localComments",
                  JSON.stringify(localComments)
                );
                return;
              } else {
                loop(element.replies);
              }
            });
          })();
        }
      });
    }
  };

  addeventHandlers();

  defaultAddCommentBtn.addEventListener("click", (e) => {
    if (e.target.previousElementSibling.value) {
      attachCommentTo(e.target.previousElementSibling.value);
      e.target.previousElementSibling.value = "";
      e.target.previousElementSibling.style.outline = "";
      addeventHandlers();
    } else {
      e.target.previousElementSibling.style.outline = "2px solid red";
      navigator.vibrate([100, 0, 30]);
    }
  });
});
