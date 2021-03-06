'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth:{
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
    }
});

/**
 * GET /contact
 *  Contact form page
 */

exports.getContact = (req,res)=>{
    res.render('contact',{
        title: 'Contact'
    }); 
};

/**
 * POST /contact
 * Send a contact form via nodemailer
 */

exports.postContact = (req,res,next)=>{
    req.assert('email','Email is not valid').notEmpty();
    req.assert('name','Name cannot be empty').notEmpty();
    req.assert('message','Message cannot be empty').notEmpty();

    const errors = req.validationErrors();
    if(errors){
        res.flash('errors',errors);
        return res.redirect('/contact');
    }

    const mailOptions = {
        to: 'your@email.com',
        from :`${req.body.name} $<req.body.email>`,
        subject: 'Contact Form | Hackathon Starter',
        text: req.body.message
    };

    transporter.sendMail(mailOptions,(err)=>{
        if(err){
            req.flash('errors',errors);
            return res.redirect('/contact');
        }
        req.flash('success', { msg: 'Email has been sent successfully!' });
        res.redirect('/contact');
    }); 
};  