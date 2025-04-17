const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyZmNjZjEyZS02YWQ3LTRmZDMtYTYwNi0xZmViMmVkMTk5YTkiLCJlbWFpbCI6ImNzMjFiMjAzNUBpaWl0ZG0uYWMuaW4iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTlmYmJhMjZlYzU1YzEyZjAzMWMiLCJzY29wZWRLZXlTZWNyZXQiOiIzMmUwZDdlYmYyNDJmMDY2MTNhZWYyY2JiN2Q4NjljMjQ3MTY4NjE1ODQ3YzRjNGVhYTIxMWUwMGYyMTk1ZGVhIiwiZXhwIjoxNzc2Mzk0ODk5fQ.L79yU9UrxoeSiJ8mUHgtoo9fjD0OKq2Dc16reZaRqRc";

export const pinata = {
  upload: {
    async file(file) {
      const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Pinata upload failed: ${text}`);
      }

      return await res.json(); // Contains IpfsHash
    },
  },
};
