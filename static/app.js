// app.js - client-side chat wiring for Flask backend
(function(){
  const form = document.getElementById('chat-form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');
  const sendBtn = document.getElementById('send');
  const typing = document.getElementById('typing');

  function appendMessage(text, isBot, meta){
    const wrap = document.createElement('div');
    wrap.className = 'message ' + (isBot ? 'bot' : 'user');

    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + (isBot ? 'bot' : 'user');
    // Do not display intent/confidence metadata; only show message text

    bubble.textContent = text;
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping(show){
    typing.style.display = show ? 'block' : 'none';
    typing.setAttribute('aria-hidden', (!show).toString());
  }

  async function sendMessage(){
    const value = input.value.trim();
    if(!value) return;

    // append user message locally immediately
    appendMessage(value, false);
    input.value = '';
    input.focus();

    // show typing indicator
    showTyping(true);

    try{
      const resp = await fetch('/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({message: value})
      });

      if(!resp.ok){
        const text = `Server error (${resp.status})`;
        appendMessage(text, true, {intent:'error', confidence:0});
        return;
      }

      const data = await resp.json();
      const botText = data && data.response ? data.response : "I'm sorry, I couldn't process that.";
      appendMessage(botText, true, {intent: data.intent || 'unknown', confidence: data.confidence || 0});

    }catch(err){
      appendMessage('Network error: failed to reach the server.', true, {intent:'error', confidence:0});
      console.error('Chat send error:', err);
    }finally{
      showTyping(false);
    }
  }

  sendBtn.addEventListener('click', (e)=>{ e.preventDefault(); sendMessage(); });

  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      e.preventDefault();
      sendMessage();
    }
  });

  // small welcome message if empty
  document.addEventListener('DOMContentLoaded', ()=>{
    if(messages.children.length === 0){
      appendMessage("Welcome to VIBEATHON — I'm your CDSC assistant. Ask me anything!", true, {intent:'greeting', confidence:1});
    }
  });

})();
