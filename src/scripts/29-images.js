  // ================= images =================
  function downscale(file){
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const W = 300, H = 400, c = document.createElement("canvas"); c.width = W; c.height = H;
        const r = Math.max(W / img.width, H / img.height), w = img.width * r, h = img.height * r;
        c.getContext("2d").drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
        URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", .8));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(); };
      img.src = url;
    });
  }
  const imageFrom = list => [...(list || [])].find(f => f.type?.startsWith("image/"));

