const postMessage = async ({ name: sender, message }) => {
  const response = await fetch(`message/new${window.location.pathname || ''}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify({
      sender,
      message,
    }),
  });
  return await response.json();
};
const onSubmitMessage = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const name = document.querySelector('[name="name"]');
  const message = document.querySelector('[name="message"]');
  postMessage({ name: name.value, message: message.value }).then();
};
setTimeout(() => {
  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => onSubmitMessage(e));
}, 100);
const main = () => {
  const eventSource = new EventSource(
    `message/sse${window.location.pathname || ''}`,
  );
  eventSource.onmessage = (event) => {
    addElement(JSON.parse(event.data));
  };
  eventSource.addEventListener('ping', (event) => {
    addElement(JSON.parse(event.data));
  });
  eventSource.onerror = (event) => {
    console.log({ event });
    eventSource.close();
  };
  const addElement = ({ sender, text: message }) => {
    const target = document.getElementsByClassName('target')[0];
    const newElement = document.createElement('div');
    newElement.innerHTML = `${sender} &mdash; ${message}`;
    target.appendChild(newElement);
  };
};
main();
