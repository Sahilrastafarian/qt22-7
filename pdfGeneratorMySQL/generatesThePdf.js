const { jsPDF } = require('jspdf');
const mysql = require('../databaseMySql/dbConnect.js');
const message = mysql.message;
const sequelize = mysql.sequelize;

const pdf = new jsPDF({
    orientation: "portrait",
    unit: "cm",
    format: "a4"
});


const createPDF = async (groupId, limit, myEmail) => {
    
    let messages = await sequelize.query(`select message, timeStamp, senderId from messages where reciverGroupId = ${groupId} order by timeStamp limit ${limit}`,{
        type: sequelize.QueryTypes.SELECT
    }).catch(function(err){
        console.log(err);
    })

    pdf.setTextColor(0,0,0);
    pdf.setFontSize(30);
    pdf.text("sender text",1.5,3.5);
    pdf.text("your text",12, 3.5);

    let x = 1;
    let y = 5;
    pdf.setLineWidth(0.05);
    pdf.line(10,4.4,10,30);
    messages.forEach(item=>{
        pdf.setTextColor(0,0,0);
        pdf.setFontSize(15);
        const time= new Date(item.timeStamp);
        if(item.senderId === myEmail)
        {
            const text = pdf.splitTextToSize(item.message+"  "+time.toLocaleTimeString(),6);
            pdf.line(0,y-0.65,21,y-0.65);
            pdf.text(text,x+11,y);
            pdf.setLineWidth(0.05);
            for(let i = 0; i < text.length;i++)
            {
                if ( y > 24 )
                {
                    pdf.addPage();
                    pdf.line(10,0,10,30);
                    y = 3;
                }
            }
            y = y + text.length;
        }
        else
        {
            const text = pdf.splitTextToSize(time.toLocaleTimeString()+"  "+item.message, 6);
            pdf.line(0,y-0.65,21,y-0.65);
            pdf.text(text,x,y);
            pdf.setLineWidth(0.05);
            for(let i = 0; i < text.length;i++)
            {
                if ( y > 24 )
                {
                    pdf.addPage();
                    pdf.line(10,0,10,30);
                    y = 3;
                }
            }
            y = y + text.length;
        }
        if( y > 30)
        {
            pdf.addPage();
            y = 3;
        }
    })
    let pdfOutput = pdf.output("datauristring");
    const pdfString = pdfOutput.split(',')[1];
    return pdfString;
};

module.exports = createPDF;