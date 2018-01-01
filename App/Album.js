var superagent = require('superagent')
var cheerio = require('cheerio')
require('superagent-charset')(superagent)
require('superagent-proxy')(superagent);

const mysql = require('./Mysql')
const md5 = require('md5')

const proxy = process.env.http_proxy || 'http://127.0.0.1:1080';
const base_url = 'http://youkezjz.ml/'

function getAlbum(url){
    console.log("GET => " ,url)
    superagent.get(url).charset('gbk').end((err, sres) => {
        if (err) {
            return err;
        }
        var $ = cheerio.load(sres.text);
        var items = [];
        var title = $('title').text().split(' - ')[0]
        $('.tpc_content input').each((idx, element) =>  {
            var $element = $(element);
            items.push($element.attr('src'));
        });
        mysql.getConnection(function(err, db) {
            db.execute("INSERT INTO `albums` (`md5`,`title`,`images`) VALUES (?,?,?);",[md5(url), title, JSON.stringify(items)],(err, rows) => {
                if (err) {
                    db.release();
                    return err;
                }else{
                    console.log('inserted ' + title + ' success')
                }
                db.release();
            })
        })
        
    })
}

// getAlbum(base_url + 'htm_data/8/1712/2885476.html')

function getAlbumPage(pagenum){
    var url = base_url + 'thread0806.php?fid=8&search=&type=4&page=' + pagenum
    superagent.get(url).charset('gbk').end((err, sres) => {
        if (err) {
            return err;
        }
        var $ = cheerio.load(sres.text);
        var items = [];
        $('td.tal h3 a').each((idx, element) =>  {
            var $element = $(element);
            // items.push($element.text(),$element.attr('href'));
            getAlbum(base_url + $element.attr('href'))
        });
        console.log(items)
    })
}

for(i = 1; i <= 98; i++){
    getAlbumPage(i)
}