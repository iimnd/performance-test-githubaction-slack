import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';


// A simple counter for http requests

export const requests = new Counter('http_reqs');



// you can specify stages of your test (ramp up/down patterns) through the options object
// target is the number of VUs you are aiming for

export const options = {
  stages: [
    { target: 20, duration: '10s' }
  ],
  
};

export default function () {
  // our HTTP request, note that we are saving the response to res, which can be accessed later

  const res = http.get('http://test.k6.io');

  sleep(1);

 
}

export const SLACK_TOKEN = `${__ENV.SLACK_TOKEN}`;
export const action_url=  `${__ENV.GITHUB_SERVER_URL}/${__ENV.GITHUB_REPOSITORY}/runs/${__ENV.GITHUB_RUN_ID}?check_suite_focus=true`; 

export function sendSlack(data){
    console.log(JSON.stringify(data));
    let color_treshold ="#632eb8";
    if (data.metrics.http_req_failed.values.rate.toFixed(2)*100 > 5){
        color_treshold= "#bf3017";
    }
   let payload= {
        channel: "monitoring-devops",
        attachments: [
            {
                color: color_treshold,
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": "Performance Test Result",
                            "emoji": true
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": "*Test Duration:*\n" + data.state.testRunDurationMs + " ms"
                            },
                            {
                                "type": "mrkdwn",
                                "text": "*Type Test:*\n Smoke Test"
                            }
                           
                            
                            
                            
                        ],
                        accessory: {
                            type: "image",
                            image_url: "https://k6.io/images/landscape-icon.png",
                            alt_text: "k6_thumbnail"
                        }
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": "*System Name:*\n Mantra"
                            },
                            {
                                "type": "mrkdwn",
                                "text": "*Request Rate:*\n" + data.metrics.http_reqs.values.rate.toFixed(2)  + " /s"
                            }
                        ]
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": "*Error Rate:*\n"+ data.metrics.http_req_failed.values.rate.toFixed(2)*100 + " %"
                            },
                            {
                                "type": "mrkdwn",
                                "text": "*Total Request:*\n" + data.metrics.http_reqs.values.count 
                            }
                        ]
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": "*Request Duration (Min):*\n"+ data.metrics.http_req_duration.values.min.toFixed(2)  + " ms"
                            },
                            {
                                "type": "mrkdwn",
                                "text": "*Request Duration (Max):*\n"+ data.metrics.http_req_duration.values.max.toFixed(2)  + " ms"
                            }
                        ]
                    },
                    {
                        "type": "section",
                        "fields": [
                            {
                                "type": "mrkdwn",
                                "text": "*Request Duration (Avg):*\n"+ data.metrics.http_req_duration.values.avg.toFixed(2)  + " ms"
                            },
                            {
                                "type": "mrkdwn",
                                "text": "*Request Duration (P95):*\n"+ data.metrics.http_req_duration.values['p(95)'].toFixed(2) + " ms"
                            }
                        ]
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "<"+action_url+"|View Results on Github>"
                        },
                       
                    },
                    
                ]
    
            }
        ],
    };



  
    const slackRes = http.post( 'https://slack.com/api/chat.postMessage', JSON.stringify(payload), {
        headers :{
            'Authorization': `Bearer ${SLACK_TOKEN}`,
            'Content-Type': 'application/json'
        }
    }); 

}


export function handleSummary(data){
    sendSlack(data);
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }), // Show the text summary to stdout...
      };
   

}
