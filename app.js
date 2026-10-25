'use strict';
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let heroPaused=reduced.matches,worldPaused=reduced.matches,signalLost=false,speed=.35,realElapsed=0,virtualElapsed=0,lastFrame=0,lastDisplay=0,heroPhase=0;
const heroCanvas=$('#heroCanvas'),heroCtx=heroCanvas.getContext('2d'),signalCanvas=$('#signalCanvas'),signalCtx=signalCanvas.getContext('2d');
let heroW=500,heroH=560,signalW=260,signalH=80,heroTitleEnd=500;
function sizeCanvases(){heroTitleEnd=$('.hero-title-line').getBoundingClientRect().right-heroCanvas.getBoundingClientRect().left;const dpr=Math.min(devicePixelRatio||1,2);for(const [c,ctx] of [[heroCanvas,heroCtx],[signalCanvas,signalCtx]]){const r=c.getBoundingClientRect();c.width=r.width*dpr;c.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);if(c===heroCanvas){heroW=r.width;heroH=r.height}else{signalW=r.width;signalH=r.height}}drawHero(heroPhase)}
new ResizeObserver(sizeCanvases).observe(heroCanvas);new ResizeObserver(sizeCanvases).observe(signalCanvas);
const brainHalf=new Path2D('M -8 -155 C -11 -181 -37 -202 -62 -193 C -83 -211 -119 -201 -134 -180 C -164 -188 -190 -163 -187 -140 C -218 -135 -232 -107 -219 -82 C -246 -62 -243 -28 -227 -11 C -245 15 -224 52 -206 61 C -207 92 -181 119 -155 117 C -136 148 -103 155 -79 139 C -54 159 -19 143 -9 116 C -3 63 -14 26 -7 -21 C -15 -68 -2 -116 -8 -155 Z');
const brainFolds=[
 'M -23 -167 C -58 -181 -81 -157 -67 -132 C -89 -112 -127 -139 -144 -111',
 'M -110 -180 C -123 -158 -107 -145 -111 -129',
 'M -164 -153 C -179 -134 -152 -113 -165 -94 C -180 -80 -207 -94 -217 -67',
 'M -20 -123 C -43 -137 -63 -112 -53 -90 C -46 -69 -76 -65 -91 -78 C -111 -98 -143 -79 -134 -54',
 'M -199 -51 C -175 -71 -157 -44 -168 -24 C -191 -3 -215 -13 -213 15',
 'M -18 -68 C -41 -52 -37 -26 -65 -25 C -94 -44 -116 -28 -112 -7 C -107 17 -143 26 -159 9',
 'M -86 -91 C -99 -70 -82 -56 -93 -41',
 'M -21 -8 C -47 10 -46 38 -68 41 C -100 25 -117 52 -105 70 C -79 81 -78 109 -92 125',
 'M -193 37 C -171 28 -157 45 -165 65 C -166 86 -141 92 -126 79',
 'M -21 58 C -52 45 -71 69 -58 89 C -45 110 -62 125 -70 133',
 'M -140 110 C -137 91 -116 106 -113 125',
 'M -203 -106 C -196 -123 -177 -126 -173 -115',
 'M -126 18 C -147 -2 -139 -30 -121 -37'
].map(p=>new Path2D(p));
const neuronPoints=[[-67,-132],[-144,-111],[-165,-94],[-53,-90],[-91,-78],[-168,-24],[-65,-25],[-112,-7],[-68,41],[-105,70],[-165,65],[-58,89],[-113,125],[-23,-167]];
function drawHero(t){
 const c=heroCtx,w=heroW,h=heroH;c.clearRect(0,0,w,h);const mobile=w<650;
 const size=Math.min(w*(mobile?.0017:.00086),h*.0015);
 const cx=mobile?w*.64:Math.min(w-245*size-32,heroTitleEnd+44+235*size),cy=h*(mobile?.65:.50);
 c.save();c.translate(cx,cy);c.scale(size,size);c.rotate(Math.sin(t*.12)*.035);
 // Two cortical hemispheres with a visible longitudinal fissure.
 for(let side=0;side<2;side++){
  c.save();if(side)c.scale(-1,1);
  const g=c.createLinearGradient(-235,-190,0,140);g.addColorStop(0,'rgba(86,132,242,.12)');g.addColorStop(1,'rgba(73,104,200,.025)');
  c.fillStyle=g;c.fill(brainHalf);c.shadowColor='#689fff';c.shadowBlur=12;c.strokeStyle='rgba(148,186,255,.66)';c.lineWidth=1.2;c.stroke(brainHalf);c.shadowBlur=0;
  for(let j=0;j<brainFolds.length;j++){c.lineWidth=.95;c.strokeStyle=`rgba(128,173,255,${.32+.13*Math.sin(t*.4+j*.6)})`;c.setLineDash([]);c.stroke(brainFolds[j]);c.lineWidth=1.5;c.setLineDash([9,140]);c.lineDashOffset=-t*13-j*23;c.strokeStyle='rgba(187,218,255,.65)';c.stroke(brainFolds[j]);}c.setLineDash([]);
  // Faint inner filaments make the brain feel spatial without spinning the text.
  c.save();c.clip(brainHalf);for(let j=0;j<18;j++){const y=-190+j*20;c.beginPath();c.moveTo(-245,y);c.bezierCurveTo(-155,y-22,-90,y+24,8,y+5);c.strokeStyle='rgba(98,147,247,.10)';c.lineWidth=.65;c.stroke();}c.restore();
  neuronPoints.forEach(([x,y],i)=>{const pulse=(Math.sin(t*.8+i*1.7+side*2)+1)/2;c.beginPath();c.arc(x,y,1.3+pulse*1.2,0,Math.PI*2);c.fillStyle=`rgba(167,211,255,${.4+pulse*.5})`;c.shadowColor='#75baff';c.shadowBlur=5+pulse*12;c.fill();c.shadowBlur=0;if(pulse>.9){c.beginPath();c.arc(x,y,5+(pulse-.9)*32,0,Math.PI*2);c.lineWidth=.5;c.strokeStyle='rgba(120,179,255,.2)';c.stroke();}});
  c.restore();
 }
 c.beginPath();c.moveTo(-12,123);c.bezierCurveTo(-25,146,-20,172,-15,187);c.bezierCurveTo(-7,193,7,193,15,187);c.bezierCurveTo(20,171,25,145,12,123);c.strokeStyle='rgba(143,183,255,.42)';c.lineWidth=1;c.stroke();
 c.restore();
}
function visible(el){const r=el.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}
function animation(time){const dt=lastFrame?Math.min((time-lastFrame)/1000,.1):0;lastFrame=time;
 if(!document.hidden){if(!heroPaused&&visible(heroCanvas)){heroPhase+=dt;drawHero(heroPhase)}
 if(!worldPaused&&!$('#worldExperience').hidden&&visible($('#worldExperience'))){realElapsed+=dt;virtualElapsed+=dt*(signalLost?1:speed)}
 if(time-lastDisplay>65){$('#realOrb').style.left=`${(realElapsed%5)/5*100}%`;$('#virtualOrb').style.left=`${(virtualElapsed%5)/5*100}%`;$('#realTime').innerHTML=realElapsed.toFixed(1)+'<small> s</small>';$('#virtualTime').innerHTML=virtualElapsed.toFixed(1)+'<small> s</small>';lastDisplay=time;
 if(visible(signalCanvas)&&(!reduced.matches||time<1000)){signalCtx.clearRect(0,0,signalW,signalH);for(let n=0;n<3;n++){signalCtx.beginPath();for(let x=0;x<signalW;x++){const p=x*.075+time*.001,y=(n+1)*signalH/4+Math.sin(p*(n+1))*5+Math.sin(p*3.3)*2;x?signalCtx.lineTo(x,y):signalCtx.moveTo(x,y)}signalCtx.strokeStyle=['#6b8bc6','#a7a3d5','#a1b8df'][n];signalCtx.lineWidth=1;signalCtx.stroke()}}}}
 requestAnimationFrame(animation)}requestAnimationFrame(animation);
function renderControl(){const rate=signalLost?1:speed;$('#worldRate').textContent=rate.toFixed(2)+'×';$('#speedOutput').textContent=rate.toFixed(2)+'×';$('#speed').disabled=signalLost;$('#pauseWorld').textContent=worldPaused?'继续动画':'暂停动画';$('#signalButton').setAttribute('aria-pressed',String(signalLost));$('#signalButton').textContent=signalLost?'↺ 恢复模拟 EEG 信号':'⌁ 模拟 EEG 信号丢失';$('#signalStatus').textContent=signalLost?'信号丢失，场景恢复 1.00× 正常速度。你可以随时恢复模拟信号，继续体验。':'脑电感知状态，虚拟环境随之响应。'}
$('#speed').addEventListener('input',e=>{speed=Number(e.target.value)/100;renderControl()});$('#pauseWorld').addEventListener('click',()=>{worldPaused=!worldPaused;renderControl()});$('#resetWorld').addEventListener('click',()=>{realElapsed=0;virtualElapsed=0;renderControl()});$('#signalButton').addEventListener('click',()=>{signalLost=!signalLost;renderControl()});$('#heroMotion').addEventListener('click',()=>{heroPaused=!heroPaused;$('#heroMotion').textContent=heroPaused?'▷':'Ⅱ';$('#heroMotion').setAttribute('aria-label',heroPaused?'继续首页动画':'暂停首页动画')});renderControl();$('#heroMotion').textContent=heroPaused?'▷':'Ⅱ';$('#heroMotion').setAttribute('aria-label',heroPaused?'继续首页动画':'暂停首页动画');
let trialToken=0,trialDurations=[];
function abortTrial(){trialToken++;$('#stimulus').style.display='none';$('#trialPrompt').hidden=false;$('#startTrial').disabled=false;$('#startTrial').innerHTML='开始体验 <span>→</span>';$('#trialAnswers').hidden=true;$('#trialProgress').textContent='准备好了就开始。无需刻意数秒。'}
$$('[data-experience]').forEach(b=>b.addEventListener('click',()=>{$$('[data-experience]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));const world=b.dataset.experience==='world';$('#worldExperience').hidden=!world;$('#perceptionExperience').hidden=world;abortTrial();$('#trialResult').textContent=''}));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
$('#startTrial').addEventListener('click',async()=>{const token=++trialToken;trialDurations=[];$('#startTrial').disabled=true;$('#startTrial').textContent='请观察图形…';$('#trialAnswers').hidden=true;$('#trialResult').textContent='';$('#trialPrompt').hidden=true;
 for(let i=0;i<5;i++){if(token!==trialToken)return;$('#trialProgress').textContent=`图形 ${i+1} / 5`;
  $('#stimulus').classList.toggle('oddball',i===4);$('#stimulus').style.display='block';const start=performance.now();await delay(900);if(token!==trialToken)return;trialDurations.push(performance.now()-start);$('#stimulus').style.display='none';await delay(350);if(token!==trialToken)return;
 }$('#trialAnswers').hidden=false;$('#trialProgress').textContent='最后一个图形，比前面的圆形持续更久吗？';$('#startTrial').disabled=false;$('#startTrial').textContent='再体验一次';$('#trialPrompt').innerHTML='你刚刚的感觉，<br>就是这次要观察的东西。';$('#trialPrompt').hidden=false;});
$$('[data-answer]').forEach(b=>b.addEventListener('click',()=>{const answer={longer:'更久',same:'差不多',shorter:'更短'}[b.dataset.answer];const min=Math.min(...trialDurations),max=Math.max(...trialDurations);$('#trialResult').textContent=`你选择了「${answer}」。5 个图形的目标呈现时长相同，均为 0.90 秒。本次脚本计时约 ${(min/1000).toFixed(2)}–${(max/1000).toFixed(2)} 秒。`;$('#trialAnswers').hidden=true}));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&$('#startTrial').disabled){abortTrial();$('#trialResult').textContent='页面切换打断了呈现，请重新开始。'}});

const papers={
 oddball:{year:'2004',type:'行为实验 · 主观时长',headline:'同样的客观时长，可以被判断为更长。',title:'Tse, Intriligator, Rivest & Cavanagh. Attention and the subjective expansion of time. Perception & Psychophysics 66, 1171–1189.',finding:'研究发现，序列中偶尔出现的意外刺激，往往被感觉为持续更久。作者将这种现象与注意的转向联系起来。',supports:'支持“主观时长可以受情境影响”，为设计虚拟环境中的注意线索提供出发点。',limit:'研究考察的是短时刺激的时长判断。把这种现象扩展到一段持续的沉浸体验，还需要观察效果能保持多久，以及注意和预期如何参与其中。',url:'https://cavlab.net/MyRWResources/MyPDFs/PDF2004/Tseetal2004.pdf',visual:'相同的时长，可以有不同的感受'},
 eeg:{year:'2025',type:'EEG × VR · 最接近本构想',headline:'时间判断的差异，与脑电谱特征有关联。',title:'Niknam, Duraisamy, Botev & Leiva. Brain Signatures of Time Perception in Virtual Reality. IEEE TVCG. DOI: 10.1109/TVCG.2025.3549570.',finding:'分析 33 名参与者的 8 通道 EEG 与 VR 时长判断，报告高估、准确估计、低估状态对应的谱特征。测试事件主要为 2、4、6 秒。',supports:'为非侵入式 EEG 作为时间状态的候选反馈信号提供依据。',limit:'作者在实验结束后分析脑电与时长判断的关系。部分调节条件与对照条件的差异未达到统计显著。接下来需要检验这些线索能否用于实时反馈，以及反馈能否稳定改变体验。',url:'https://arxiv.org/abs/2504.08056',visual:'主观报告 ↔ EEG 统计特征'},
 alpha:{year:'2015',type:'神经机制线索 · 相关研究',headline:'α 节律的频率，关联视觉时间分辨率。',title:'Samaha & Postle. The Speed of Alpha-Band Oscillations Predicts the Temporal Resolution of Visual Perception. Current Biology 25, 2985–2990.',finding:'研究发现较快的枕部 α 频率与更好的双闪光区分表现有关，既观察了个体间差异，也观察了个体内波动。',supports:'说明神经时间尺度与某些感知时间指标有关，可以启发候选特征选择。',limit:'这项研究测量的是区分两次闪光的能力，得到的是相关性结果。通过训练改变 α 节律后，视觉分辨表现、主观时长和思考速度会怎样变化，需要分别设计实验。',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC4654641/',visual:'节律频率 ↔ 双闪光区分'},
 fear:{year:'2007',type:'自由落体 · 回忆与感知',headline:'惊险时刻，在回忆里被拉长。',title:'Stetson, Fiesta & Eagleman. Does Time Really Slow Down during a Frightening Event? PLOS ONE 2(12), e1295.',finding:'自由落体实验中，参与者回忆自己的下落时长更长。视觉时间分辨任务的表现则未显示提高。',supports:'研究把回忆中的时长与当时的视觉分辨表现分开测量，为慢时域选择评价指标提供了参考。',limit:'这里观察到的变化主要体现在回忆时长上。反应速度、思考能力需要各自的任务来评价。慢时域计划从温和的虚拟场景开始探索。',url:'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0001295',visual:'回忆时长与即时分辨，分别测量'},
 vr:{year:'2023',type:'虚拟环境 · 时间预期',headline:'虚拟场景改变了人们对物理过程时长的预期。',title:'Validating virtual reality for time perception research: Virtual reality changes expectations about the duration of physical processes, but not the sense of time. PMID: 37752369.',finding:'该实验中，参与者对物理过程时长的判断随 VR 条件发生变化，以抽象时间单位进行的判断则保持稳定。',supports:'支持将 VR 作为可控实验环境，同时要求控制人们对运动和事件持续时间的预期。',limit:'这项结果提示我们把对场景的预期也纳入实验。可以在相同刺激下比较不同提示，再分别记录时长判断与时间流逝感。',url:'https://pubmed.ncbi.nlm.nih.gov/37752369/',visual:'环境节奏 → 预期？时间感？'}
};
let priorFocus=null;
function openDialog(d){priorFocus=document.activeElement;d.showModal();document.body.classList.add('modal-open')}
function closeDialog(d){d.close();document.body.classList.remove('modal-open');priorFocus?.focus()}
$$('[data-paper]').forEach(b=>b.addEventListener('click',()=>{const p=papers[b.dataset.paper];$('#paperContent').innerHTML=`<p class="eyebrow">${p.year} / ${p.type}</p><h2>${p.headline}</h2><p class="paper-title">${p.title}</p><div class="paper-finding"><h3>研究发现</h3><p>${p.finding}</p></div><div class="paper-visual" aria-hidden="true"><i></i><span>${p.visual}</span><i></i></div><div class="paper-finding"><h3>对慢时域的启发</h3><p>${p.supports}</p></div><div class="paper-limit"><h3>研究范围与下一步</h3><p>${p.limit}</p></div><a class="button" href="${p.url}" target="_blank" rel="noopener noreferrer">阅读原始论文 <span>↗</span></a>`;openDialog($('#paperDialog'))}));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog($('#'+b.dataset.close))));
$$('dialog').forEach(d=>{d.addEventListener('close',()=>{document.body.classList.remove('modal-open');});d.addEventListener('click',e=>{if(d.id==='paperDialog'&&e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d)}})});
const stepText=['<b>采集与校准</b> · EEG 记录头皮电位，你的回答记录主观时长。课件第 13、14 页提供采集—解码—反馈闭环与非侵入式技术基础。','<b>状态估计</b> · 先识别眨眼、运动等干扰，再用独立数据检验脑电与时长判断的关系。每次估计都同时记录可靠程度。','<b>反馈与复测</b> · 根据估计结果调整虚拟环境的节奏与线索。比较脑电反馈与预设播放，观察主观时长的变化能否重复出现。'];
$$('[data-step]').forEach(b=>b.addEventListener('click',()=>{$$('[data-step]').forEach(x=>x.classList.toggle('active',x===b));$('#stepDetail').innerHTML=stepText[Number(b.dataset.step)]}));
$$('[role=tablist]').forEach(l=>l.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=$$('[role=tab]',l);let i=tabs.indexOf(document.activeElement);if(i<0)return;e.preventDefault();i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[i].focus();tabs[i].click()}));

