export async function exportToWord() {
  try {
    const response = await fetch('http://localhost:3000/admin/requests');
    const data = await response.json();
    const requests = data.result;

    const doc = new docx.Document();

    const title = new docx.Paragraph("Все заявки");
    title.heading1().center();
    doc.addParagraph(title);

    requests.forEach(request => {
      const idParagraph = new docx.Paragraph();
      idParagraph.addRun(new docx.TextRun({
        text: `ID: ${request.RequestID}`,
        bold: true
      }));

      const userParagraph = new docx.Paragraph();
      userParagraph.addRun(new docx.TextRun({
        text: `Пользователь: ${request.UserName}`
      }));

      const masterParagraph = new docx.Paragraph();
      masterParagraph.addRun(new docx.TextRun({
        text: `Мастер: ${request.MasterName}`
      }));

      const emptyParagraph = new docx.Paragraph("");

      doc.addParagraph(idParagraph);
      doc.addParagraph(userParagraph);
      doc.addParagraph(masterParagraph);
      doc.addParagraph(emptyParagraph);
    });

    const packer = new docx.Packer();

    packer.toBlob(doc).then(blob => {
      saveAs(blob, "requests.docx");
    });
  } catch (error) {
    console.error('Ошибка при экспорте данных:', error);
    alert('Не удалось экспортировать данные');
  }
}
