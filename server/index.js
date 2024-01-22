const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());


// middleware for admin authentication
const adminAuth = (req, res, next)=>{
    const { username, password} = req.headers;
    fs.readFile("../admins.json", "UTF-8", (err, data)=>{
        if(data)
        {
            var isAdminFound = false;
            var admins = JSON.parse(data);
            admins.map(admin =>{
                if(admin.username === username && admin.password === password)
                {
                    isAdminFound = true;
                }
            });
            
            if(isAdminFound)
            {
                next();
            }
            else{
                res.status(404).json({msg : "Admin authentication failed"});
            }

        }
    })
}


// for admin to signup
app.post("/admin/signup", (req,res)=>{
    var username = req.body.username;
    var password  = req.body.password;
    const newAdmin = {
        id : Math.floor(Math.random()*1000000),
        username,
        password
    }

    fs.readFile("../admins.json", "UTF-8", (_err, data)=>{
        if(data)
        {
            const admins = JSON.parse(data);
            const updatedAdmins = [];
            admins.map(admin =>{
                if(username != admin.username || password != admin.password)
                {
                    // admin not present
                    updatedAdmins.push(admin);
                    

                }
            });
            
            // if count of old admins and new admins are not same then the admin is present already
            updatedAdmins.push(newAdmin);
            fs.writeFile("../admins.json", JSON.stringify(updatedAdmins), (err)=>{
                if(err)
                {
                    console.log("err in updating admin list");
                }
            });
        }
    });
    res.status(200).json(newAdmin);
})

// for admin to signin
app.post("/admin/login", (req, res)=>{
    var username = req.body.username;
    var password  = req.body.password;
    fs.readFile("../admins.json", "UTF-8", (_err, data)=>{
        if(data)
        {
            // data came out is stringyfied so first convert it into JSON object
            var admins = JSON.parse(data);
            var isAdminFound = false;
            admins.map(admin =>{
                if(admin.username === username && admin.password === password)
                {
                    isAdminFound = true;
                }
            });
            if(isAdminFound)
            {
                console.log("Admin found")
            }
            else{
                console.log("Admin not found")
            }
        }
        else{
            console.log("Error reading file");
        }
    });
    res.status(200).send();
})

// for posting courses by admin
var count = 1;
app.post("/admin/course", adminAuth, (req, res)=>{
    let title = req.body.title;
    let description = req.body.description;
    let price = req.body.price;
    const newCourse = {
        id : count,
        title,
        description,
        price
    };
    count = count +1;

    // first read the file then add this new course to existing course
    fs.readFile("../courses.json", "UTF-8", (_err, data) =>{
        if(data)
        {
            // convertes the string data into json
            const courses = JSON.parse(data);
            courses.push(newCourse);

            // adding the updated course list to the file
            fs.writeFile("../courses.json", JSON.stringify(courses), (err)=>{
                if(err)
                {
                    console.log("err in rewriting");
                }
            });
        }
        else{
            console.log("could not read file");
        }
    })
    
    res.status(200).send(newCourse);
});

// to get all courses added by the admin
app.get("/admin/courses", adminAuth, (_req, res)=>{

    
    fs.readFile("../courses.json", "UTF-8", (_err, data)=>{
        if(data)
        {
            const courses = JSON.parse(data);
            res.status(200).json(courses);
        }
        else{
            res.status(404).send("Could not read file")
        }
    });
    return;
});

// for deleting course by admin by giving course id
app.delete("/admin/course/:id", adminAuth, (req, res)=>{
    var id = parseInt(req.params.id);
    fs.readFile("../courses.json", "UTF-8", (_err, data)=>{
        if(data)
        {
            const courses = JSON.parse(data);
            const updatedCouse = [];
            courses.map(course =>{
                if(course.id != id)
                {
                    updatedCouse.push(course);
                }
            });

            // write the updated course to the file
            fs.writeFile("../courses.json", JSON.stringify(updatedCouse), (err)=>{
                if(err)
                {
                    console.log("err in writing the uodated courses");
                }
            })
        }
        else{
            console.log("err in reading file");
        }
    })
    res.status(200).send("Course deleted successfully");
})

app.listen(3000 , ()=>{
    console.log("Server running on port 3000");
})