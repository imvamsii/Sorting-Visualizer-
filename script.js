myCanvas.width=420;
myCanvas.height=380;
const margin=25;

const n=30;
const array=[];
let moves=[];
const columns=[];
const spacing = (myCanvas.width-margin*2)/n;
const ctx = myCanvas.getContext("2d");

const maxColumnHeight=200;

init();

let audioCtx=null;

function playNote(freq,type){
    if(audioCtx==null){
        audioCtx=new(
            AudioContext || 
            webkitAudioContext || 
            window.webkitAudioContext
        )();
    }
    const dur=0.2;
    const osc=audioCtx.createOscillator();
    osc.frequency.value=freq;
    osc.start();
    osc.type=type;
    osc.stop(audioCtx.currentTime+dur);

    const node=audioCtx.createGain();
    node.gain.value=0.4;
    node.gain.linearRampToValueAtTime(
        0, audioCtx.currentTime+dur
    );
    osc.connect(node);
    node.connect(audioCtx.destination);
}

function init(){
    for(let i=0; i<n; i++){
        array[i]=Math.random();
    }
    moves=[];
    for(let i=0; i<array.length; i++){
        const x=i*spacing+spacing/2+margin;
        const y=myCanvas.height-margin-i*3;
        const width=spacing-4;
        const height=maxColumnHeight*array[i];
        columns[i]=new Column(x,y,width,height);
    }
}

function play(){
    moves=bubbleSort(array);
}

animate();

function bubbleSort(array){
    const moves=[];
    do{
        var swapped=false;
        for(let i=1;i<array.length;i++){
            if(array[i-1]>array[i]){
                swapped=true;
                [array[i-1],array[i]]=[array[i],array[i-1]];
                moves.push(
                    {indices:[i-1,i],swap:true}
                );
            }else{
                moves.push(
                    {indices:[i-1,i],swap:false}
                );
            }
        }
    }while(swapped);
    return moves;
}

function animate(){
    ctx.clearRect(0,0,myCanvas.width,myCanvas.height);
    let changed=false;
    for(let i=0; i<columns.length; i++){
        changed = columns[i].draw(ctx)||changed;
    }

    if(!changed && moves.length>0){
        const move=moves.shift();
        const [i,j]=move.indices;
        const waveformType=move.swap?"square":"sine";
        playNote(columns[i].height+columns[j].height,waveformType);
        if(move.swap){
            columns[i].moveTo(columns[j]);
            columns[j].moveTo(columns[i],-1);
            [columns[i],columns[j]]=[columns[j],columns[i]];
        }else{
            columns[i].jump();
            columns[j].jump();
        }
    }

    requestAnimationFrame(animate);
}