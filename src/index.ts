// src/index.ts
import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import {
  listContainers,
  listImages,
  deleteImage,
  listNetworks,
  listVolumes,
  deleteVolume,
  createVolume,
  createContainer,
  deleteContainer,
  restartContainer,
  stopContainer,
  startContainer,
  pauseContainer,
  unpauseContainer,
  killContainer,
} from "./docker";
import { ContainerCreateOptions, VolumeCreateOptions } from "dockerode";

const app = express();
const port = 3300;
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("This is an API for Docker webUI");
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

// List all containers
app.get("/containers", async (req: Request, res: Response) => {
  try {
    const containers = await listContainers();
    res.json(containers); // Send the result as a JSON response
  } catch (err) {
    console.error("Error listing containers:", err);
    res.status(500).json({ error: "Failed to list containers" });
  }
});

// Create a container
app.post("/containers", async (req: Request, res: Response): Promise<void> => {
  const formData = req.body;
  var { containerName, imageName, ports, command, autoremove } = formData.formData;

  console.log("Received request to create container:", {
    containerName,
    imageName,
    ports,
    command,
    autoremove,
  });

  if (!imageName || !    containerName  ) {
    res.status(400).json({ error: "Image and name are required" });
    return;
  }

  // Validate ports
  if (ports && !Array.isArray(ports)) {
    res.status(400).json({ error: "Ports should be an array" });
    return;
  }

  var exposedPorts: ContainerCreateOptions["ExposedPorts"] = {};
  var hostConfig: ContainerCreateOptions["HostConfig"] = {};
  if (ports) {
    for (const port of ports) {
      const hostPort = port.hostPort;
      const containerPort = port.containerPort;
      if (hostPort && containerPort) {
        exposedPorts[`${containerPort}/tcp`] = {};
        hostConfig[`PortBindings`] = {
          [`${containerPort}/tcp`]: [
            {
              HostPort: hostPort,
            },
          ],
        };
      }
      
    }
  }

  var options : ContainerCreateOptions = {
    Image: imageName,
    name: containerName,
    Tty: true,
    ExposedPorts: exposedPorts,
    HostConfig: hostConfig,
  };

  console.log("Container creation options:");
  console.dir(options, { depth: null });


  try {
    const container = await createContainer(imageName, containerName, {
      options });
    res.status(201).json(container);
  } catch (err) {
    console.error("Error creating container:", err);
    res.status(500).json({ error: "Failed to create container" });
  }
});


app.get("/containers/:id", async (req: Request, res: Response) => {
  res.send("This is not implemented yet");
});

// Delete a container
app.delete("/containers", async (req: Request, res: Response) => {
  const containerId = req.body.containerId;
  if (!containerId) {
    res.status(400).json({ error: "Container ID is required" });
    return;
  }

  try {
    const container = await deleteContainer(containerId);
    if (!container) {
      res.status(404).json({ error: "Container not found" });
      return;
    }
    res.status(200).json({ message: "Container deleted successfully" });
  } catch (err) {
    console.error("Error deleting container:", err);
    res.status(500).json({ error: "Failed to delete container" });
  }
});

app.delete("/containers/:id", async (req: Request, res: Response) => {
  const containerId = req.params.id;
  if (!containerId) {
    res.status(400).json({ error: "Container ID is required" });
    return;
  }
  try {
    const container = await deleteContainer(containerId);
    if (!container) {
      res.status(404).json({ error: "Container not found" });
      return;
    }
    res.status(200).json({ message: "Container deleted successfully" });
  } catch (err) {
    console.error("Error deleting container:", err);
    res.status(500).json({ error: "Failed to delete container" });
  }
});

// Restart a container
app.post("/containers/restart", async (req: Request, res: Response) => {
  const containerId = req.body.containerId;
  if (!containerId) {
    res.status(400).json({ error: "Container ID is required" });
    return;
  }

  try {
    await restartContainer(containerId);
    res.status(200).json({ message: "Container restarted successfully" });
  } catch (err) {
    console.error("Error restarting container:", err);
    res.status(500).json({ error: "Failed to restart container" });
  }
});

// Stop a container
app.post("/containers/stop", async (req: Request, res: Response) => {
  const containerId = req.body.containerId;
  if (!containerId) {
    res.status(400).json({ error: "Container ID is required" });
    return;
  }

  try {
    await stopContainer(containerId);
    res.status(200).json({ message: "Container stopped successfully" });
  } catch (err) {
    console.error("Error stopping container:", err);
    res.status(500).json({ error: "Failed to stop container" });
  }
});
// Start a container
app.post("/containers/start", async (req: Request, res: Response) => {
  const containerId = req.body.containerId;
  if (!containerId) {
    res.status(400).json({ error: "Container ID is required" });
    return;
  }
  try {
    await startContainer(containerId);
    res.status(200).json({ message: "Container started successfully" });
  } catch (err) {
    console.error("Error starting container:", err);
    res.status(500).json({ error: "Failed to start container" });
  }
});
// Pause a container
app.post("/containers/pause", async (req: Request, res: Response) => {
  const containerId = req.body.containerId;
  if (!containerId) {
    res.status(400).json({ error: "Container ID is required" });
    return;
  }
  try {
    await pauseContainer(containerId);
    res.status(200).json({ message: "Container paused successfully" });
  } catch (err) {
    console.error("Error pausing container:", err);
    res.status(500).json({ error: "Failed to pause container" });
  }
});
// Unpause a container
app.post("/containers/unpause", async (req: Request, res: Response) => {
  const containerId = req.body.containerId;
  if (!containerId) {
    res.status(400).json({ error: "Container ID is required" });
    return;
  }
  try {
    await unpauseContainer(containerId);
    res.status(200).json({ message: "Container unpaused successfully" });
  } catch (err) {
    console.error("Error unpausing container:", err);
    res.status(500).json({ error: "Failed to unpause container" });
  }
});

app.post("/containers/kill", async (req: Request, res: Response) => {
  const containerId = req.body.containerId;
  if (!containerId) {
    res.status(400).json({ error: "Container ID is required" });
    return;
  }
  try {
    await killContainer(containerId);
    res.status(200).json({ message: "Container killed successfully" });
  } catch (err) {
    console.error("Error killing container:", err);
    res.status(500).json({ error: "Failed to kill container" });
  }
});

// List all images
app.get("/images", async (req: Request, res: Response) => {
  try {
    const images = await listImages();
    res.json(images);
  } catch (err) {
    console.error("Error listing images:", err);
    res.status(500).json({ error: "Failed to list images" }); 
  }
});

app.delete("/images", async (req: Request, res: Response) => {
  const imageId = req.body.imageId;
  if (!imageId) {
    res.status(400).json({ error: "Image ID is required" });
    return;
  }
  try {
    const image = await deleteImage(imageId);
    if (!image) {
      res.status(404).json({ error: "Image not found" });
      return;
    }
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

app.get("/networks", async (req: Request, res: Response) => {
  try {
    const networks = await listNetworks();
    res.json(networks);
  } catch (err) {
    console.error("Error listing networks:", err);
    res.status(500).json({ error: "Failed to list networks" });
  }
});

app.get("/volumes", async (req: Request, res: Response) => {
  try {
    const volumes = await listVolumes();
    res.json(volumes);
  } catch (err) {
    console.error("Error listing volumes:", err);
    res.status(500).json({ error: "Failed to list volumes" });
  }
});

app.delete("/volumes", async (req: Request, res: Response) => {
  const volumeId = req.body.volumeId;
  if (!volumeId) {
    res.status(400).json({ error: "Volume ID is required" });
    return;
  }
  try {
    const volume = await deleteVolume(volumeId);
    if (!volume) {
      res.status(404).json({ error: "Volume not found" });
      return;
    }
    res.status(200).json({ message: "Volume deleted successfully" });
  } catch (err) {
    console.error("Error deleting volume:", err);
    res.status(500).json({ error: "Failed to delete volume" });
  }
});

app.post("/volumes", async (req: Request, res: Response) => {
  console.log("Received request to create volume:", req.body);

  const volumeName = req.body.Name;
  const volumeOptions = req.body.DriverOpts;
  const volumeDriver = req.body.Driver;
  const volumeLabels = req.body.Labels;

  var options : VolumeCreateOptions = {
    Name: volumeName,
    Driver: volumeDriver,
    Labels: volumeLabels,
    ...volumeOptions,
  };
  if (!volumeName) {
    res.status(400).json({ error: "Volume name is required" });
    return;
  }
  try {
    await createVolume(options).then((volume) => {
      console.log("Volume created successfully:", volume);
      return volume;
    }).catch((err) => {
      console.error("Error creating volume:", err);
      throw err;
    });
  } catch (err) {
    console.error("Error creating volume:", err);
    res.status(500).json({ error: "Failed to create volume" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
