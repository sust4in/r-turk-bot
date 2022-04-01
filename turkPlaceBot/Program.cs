//ManaShift was here

using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace turkPlaceBot
{
    class Program
    {
        static void Main(string[] args)
        {
            while(true)
            {
                try
                {
                    Console.WriteLine("Turk Place - Started");
                    using (var client = new HttpClient())
                    {

                        var x = args[0];
                        var y = args[1];
                        var colorcode = args[2];
                        var token = args[3];
                        Console.WriteLine("[TURK] i am trying to draw here:" + x + "," + "y:" + y);

                        client.BaseAddress = new Uri("https://gql-realtime-2.reddit.com/query");
                        client.DefaultRequestHeaders.Accept.Clear();
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", args[3]);
                        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                        client.DefaultRequestHeaders.Add("apollographql-client-name", "mona-lisa");
                        client.DefaultRequestHeaders.Add("apollographql-client-version", "0.0.1");
                        var jsonString = "{\"operationName\":\"setPixel\",\"variables\":{\"input\":{\"actionName\":\"r/replace:set_pixel\",\"PixelMessageData\":{\"coordinate\":{\"x\":" + x + ",\"y\":" + y + "},\"colorIndex\":" + colorcode + ",\"canvasIndex\":0}}},\"query\":\"mutation setPixel($input: ActInput!) {\\n  act(input: $input) {\\n    data {\\n      ... on BasicMessage {\\n        id\\n        data {\\n          ... on GetUserCooldownResponseMessageData {\\n            nextAvailablePixelTimestamp\\n            __typename\\n          }\\n          ... on SetPixelResponseMessageData {\\n            timestamp\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}";
                        var response = client.PostAsync("https://gql-realtime-2.reddit.com/query", new StringContent(jsonString, Encoding.UTF8, "application/json")).Result;
                        Console.WriteLine("[TURK] 5min break");
                    }
                    Task.Delay(300500).Wait();
                }
                catch (Exception err)
                {
                    Console.WriteLine("[TURK]ERROR:" + err.Message +" exiting...");
                }
            }
        }
    }
}
