const BASE_URL = "https://chatify-api.up.railway.app";

async function handleError(res, defaultMessage) {
  let errMessage = `${defaultMessage} (Status ${res.status})`;
  try {
    const errData = await res.json();
    if (errData?.message) {
      errMessage += ` Server says: ${errData.message}`;
    }
  } catch {
    errMessage = defaultMessage;
  }
  console.error(`${errMessage}`, res.statusText);
  throw new Error(errMessage);
}

async function handleSuccess(res, successMessage) {
  console.log(`${successMessage} (Status ${res.status} ${res.statusText})`);
  return await res.json();
}

export async function generateCsrf() {
  const res = await fetch(`${BASE_URL}/csrf`, {
    method: "PATCH",
    credentials: "include",
  });
  if (res.ok) {
    const data = await handleSuccess(res, "CSRF token fetched successfully");
    if (data?.csrfToken) {
      localStorage.setItem("csrfToken", data.csrfToken);
      return data.csrfToken;
    } else {
      console.log("No CSRF token received in response.");
      return null;
    }
  }
  await handleError(
    res,
    "Security check failed. Please try again or refresh the page."
  );
}

export async function registerUser(
  username,
  password,
  email,
  avatar,
  csrfToken
) {
  if (!csrfToken) {
    csrfToken = await generateCsrf();
  }
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password, email, avatar, csrfToken }),
  });
  if (res.ok) {
    const data = await handleSuccess(
      res,
      "Registration successful, redirecting to login..."
    );
    // Spara avatar från serverns svar, eller använd den som skickades
    const savedAvatar = data?.registerUser?.avatar || avatar;
    if (savedAvatar) {
      localStorage.setItem("avatar", savedAvatar);
    }
    return data?.registerUser;
  }
  await handleError(
    res,
    "Registration failed. The username or email may already be in use, or the input is invalid."
  );
}

export async function loginUser(username, password) {
  let csrfToken = localStorage.getItem("csrfToken");
  if (!csrfToken) {
    csrfToken = await generateCsrf();
  }
  const res = await fetch(`${BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password, csrfToken }),
  });
  if (res.ok) {
    const data = await handleSuccess(
      res,
      "Login successful, redirecting to chat..."
    );
    if (data?.token) {
      sessionStorage.setItem("jwtToken", data.token);
      return data.token;
    } else {
      console.warn("No JWT-token received in login response.");
      return null;
    }
  }
  await handleError(
    res,
    "Login failed. Please check your username and password."
  );
}

export async function getUserById(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
    },
  });
  if (res.ok) {
    return await res.json();
  }
  await handleError(res, "Failed to fetch user details.");
}

export function logoutUser() {
  try {
    localStorage.removeItem("csrfToken");
    sessionStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
    localStorage.removeItem("botAvatar");
    console.log(
      "Logout successful. csrfToken removed from localStorage, jwtToken removed from sessionStorage, userId removed from localStorage, username removed from localStorage, avatar removed from localStorage, botAvatar removed from localStorage."
    );
    return { success: true, message: "Logout successful", code: 0 };
  } catch (err) {
    console.log("Logout failed. Could not remove token from session storage.");
    return {
      success: false,
      message: "Logout failed. Please try again.",
      code: err?.code || 1,
    };
  }
}

export async function postMessages(text) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
    },
    body: JSON.stringify({ text }),
  });
  if (res.ok) {
    const data = await handleSuccess(res, "Messages sent successfully");
    const messageId = data.latestMessage?.id;
    return { ...data, latestMessage: { id: messageId } };
  }
  await handleError(res, "Failed to send messages. Please try again.");
}

export async function getUserMessages() {
  const res = await fetch(`${BASE_URL}/messages`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
    },
  });
  if (res.ok) {
    const data = await handleSuccess(res, "Messages fetched successfully");
    const messages = data?.messages || data || [];
    return messages;
  }
  await handleError(res, "Failed to fetch messages. Please try again.");
}

export async function deleteMessages(userMsgId) {
  const res = await fetch(`${BASE_URL}/messages/${userMsgId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`,
    },
  });
  if (res.ok) {
    const data = await handleSuccess(res, "Message deleted successfully");
    return data?.deleteMessage;
  }
  await handleError(res, "Failed to delete message. Please try again.");
}
export function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
