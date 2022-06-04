const express = require('express');
var bodyParser = require('body-parser')
const app = express();
const dbs = require('./dbConnect');
const fs = require('fs')

const db = dbs.getConnection();

db.connect((error)=>{
    if(error){
        console.log(error)
    }
    else{
        console.log('mysql connected')
    }
})

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

  
const file = fs.readFileSync('./addVideo.html')
const filelink = fs.readFileSync('./addLink.html')



//Home page with form
app.get('/',(req, res)=>{
    
    res.end(file)
})

//to view all datas in database
app.get('/videoinfo',(req, res)=>{
    db.query('Select Video.ID, Video.Name, Video.Description, Video.Active, VideoList.Link From Video inner join VideoList on Video.ID = VideoList.U_ID', (err, results)=>{
        if(!err){
            console.log(results)
            console.log(JSON.stringify(results));
            // res.end(JSON.stringify(results))
            res.send(results)
        }
        else{
            console.log(err)
        }
    })


})

//to view selective data by ID
app.get('/videoinfo/:id',(req, res)=>{
    db.query('Select Video.ID, Video.Name, Video.Description, Video.Active, VideoList.Link From Video inner join VideoList on Video.ID = VideoList.U_ID where ID = ?',[req.params.id], (err, results)=>{
        if(!err){
            console.log(results)
            console.log(JSON.stringify(results));
            // res.end(JSON.stringify(results))
            res.send(results)
            // res.render('home', {results})
        }
        else{
            console.log(err)
        }
    })


})


//to add Video details
app.post('/addvideo', (req, res)=>{
    console.log(req.body);
    const name = req.body.videoname;
    const des = req.body.discription;
    const active = req.body.Active_status;
    
    
    const querystring = "Insert into Video (Name, Description, Active) Values (?,?,?)"
    db.query(querystring, [name, des, active], (err, results)=>{
        if(!err){
            console.log("inserted")
            console.log(results)
            res.redirect('/addlink')
            res.end()
        }
        else{
            console.log(err)
        }
    })
  

})


//to add video link to respective video name
app.post('/addlink',(req, res)=>{
    const name = req.body.name;
    const link = req.body.Link;
    db.query('select ID, Name from Video where Name=? ',[name], (err, results)=>{
        for(var i=0; i<results.length; i++){
        if(results[i].Name.length>0){
            const id = results[i].ID
            const querystring = "Insert into VideoList (Name, Link, U_ID) values(?,?,?)"
            db.query(querystring, [name, link, id], (err, results)=>{
                if(!err){
                    console.log('inserted')
                   return res.redirect('/')
                }
                else{
                    console.log(err)
                }
            })
            console.log(id)
            console.log('exists')
        }
        // console.log(results[i].Name)
        // console.log(results[1].Name)
        // res.send(results.Name)
    }
    })
})


//form to add link
app.get('/addlink',(req, res)=>{
    
  res.end(filelink)
})


// here video names, description nd active can't be deleted directly as we have a foreign key constraint. 
// so first we need to delete all the links present in the videolink table having same name and U_ID
app.delete('/videoDel/:id',(req, res)=>{
    const querystring1 = "delete from videolist where U_ID = ?"
    const querystring2 = "delete from video where ID = ?"
    db.query(querystring1,[req.params.id], (err, results)=>{
        if(!err){
            // console.log(results)
          
            // res.render('home', {results})
            db.query(querystring2, [req.params.id],(err, result)=>{
                if(!err){
                    console.log(results)
                  return  res.send("deleted list")
                    // res.render('home', {results})
                }
                else{
                    console.log(err)
                }
            })
               
        }
        else{
            console.log(err)
        }
      
       
    })
})

//tom update video details 
app.put("/update/:id", (req, res)=>{
    const name = req.body.Name 
    const des = req.body.Description
    const active= req.body.Active
  
    
    db.query("UPDATE Video inner join VideoList on Video.ID = VideoList.U_ID SET Video.Name=?, Video.Description=?, Video.Active = ?, VideoList.Name = ? WHERE ID = ? ",[name, des, active, name, req.params.id], (err, results)=>{
        if(!err){
            console.log(results)
            res.send(results)
        }
        else{
            console.log(err)
        }
    })
    
})

//to update video links
app.put("/updateLink/:id", (req, res)=>{
    const name = req.body.Name 
    const link = req.body.Link 
  
    
    db.query("UPDATE VideoList SET Name = ?, Link = ? WHERE ID = ? ",[name, link, req.params.id], (err, results)=>{
        if(!err){
            console.log(results)
            res.send(results)
        }
        else{
            console.log(err)
        }
    })
    
})


app.listen(3000, ()=>{
    console.log('server started')
})