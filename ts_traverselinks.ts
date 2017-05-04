import * as request from 'request';
import * as cheerio from 'cheerio';
var url : any = 'http://schedule.sxsw.com/2017/artists';
interface IsxswArtist {
    artist : string;
    relurl : string;
    spotifyartist? : string;
};

let sxswArtists:IsxswArtist[]=[];
request(url,null, function (err:any, resp:any, body:any):any {
    var $ = cheerio.load(body);
    var links = $('a'); //jquery get all hyperlinks
    $(links).each(function (i, link) {
        if ($(link).attr('href').search(/artists\/\d{5}/) > 0) {
            sxswArtists.push({artist:$(link).text(),relurl:$(link).attr('href')});
            // console.log($(link).text() + ':\n  ' + $(link).attr('href'));
        }
    console.log(sxswArtists);
    });
});
