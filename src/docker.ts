import Docker, {
  ContainerInspectInfo,
  ImageInspectInfo,
  VolumeInspectInfo,
  NetworkInspectInfo,
  VolumeCreateOptions
} from "dockerode";

//var docker = new Docker({socketPath: '/var/run/docker-cli.sock'});
var docker = new Docker({ socketPath: "/var/run/docker.sock" });


export async function listContainers(): Promise<ContainerInspectInfo[]> {
  try {
    const containers = await docker.listContainers({ all: true });
    //console.log("Containers:", containers);

    // Use Promise.all to wait for all inspect calls to complete
    const containerList = await Promise.all(
      containers.map(async (container) => {
        const cont = docker.getContainer(container.Id);
        try {
          const data = await cont.inspect(); 
          return data;
        } catch (err) {
          console.error("Error inspecting container:", err);
          throw err;
        }
      })
    );

    return containerList; // Return the fully resolved list
  } catch (err) {
    console.error("Error listing containers:", err);
    throw err;
  }
}

export async function stopContainer(id: string): Promise<void> {
    try {
        const container = docker.getContainer(id);
        await container.stop();
        console.log(`Container ${id} stopped successfully`);
    }
    catch (err) {
        console.error(`Error stopping container ${id}:`, err);
        throw err;
    }
}

export async function startContainer(id: string): Promise<void> {
    try {
        const container = docker.getContainer(id);
        await container.start();
        console.log(`Container ${id} started successfully`);
    }
    catch (err) {
        console.error(`Error starting container ${id}:`, err);
        throw err;
    }
}

export async function deleteContainer(id: string): Promise<boolean> {
    try {
        const container = docker.getContainer(id);
        try {
          await container.stop();
        }
        catch (err) {
          console.error(`Error stopping container ${id}:`, err);
        }
        await container.remove();
        console.log(`Container ${id} deleted successfully`);
        return true;
    }
    catch (err) {
        console.error(`Error deleting container ${id}:`, err);
        throw err;
    }
}

export async function restartContainer(id: string): Promise<void> {
    try {
        const container = docker.getContainer(id);
        await container.restart();
        console.log(`Container ${id} restarted successfully`);
    }
    catch (err) {
        console.error(`Error restarting container ${id}:`, err);
        throw err;
    }
}

export async function pauseContainer(id: string): Promise<void> {
    try {
        const container = docker.getContainer(id);
        await container.pause();
        console.log(`Container ${id} paused successfully`);
    }
    catch (err) {
        console.error(`Error pausing container ${id}:`, err);
        throw err;
    }
}
export async function unpauseContainer(id: string): Promise<void> {
    try {
        const container = docker.getContainer(id);
        await container.unpause();
        console.log(`Container ${id} unpaused successfully`);
    }
    catch (err) {
        console.error(`Error unpausing container ${id}:`, err);
        throw err;
    }
}

export async function createContainer(
  image: string,
  name: string,
  options: { [key: string]: any }
): Promise<ContainerInspectInfo> {
  try {
    // Create the container
    const container = await docker.createContainer({
      Image: image,
      name: name,
      ...options,
    });

    // Start the container
    await container.start();
    console.log(`Container ${name} started successfully`);

    // Inspect the container
    const data = await container.inspect();
    console.log(`Container ${name} created and started successfully`);
    //console.log("Container data:", data);

    return data;
  } catch (err) {
    console.error(`Error creating container ${name}:`, err);
    throw err;
  }
}

export async function killContainer(id: string): Promise<void> {
  try {
    const container = docker.getContainer(id);
    await container.kill();
    console.log(`Container ${id} killed successfully`);
  } catch (err) {
    console.error(`Error killing container ${id}:`, err);
    throw err;
  }
}


export async function listImages(): Promise<ImageInspectInfo[]> {
  try {
    const images = await docker.listImages();
    //console.log("Images:", images);
    const imageList = await Promise.all(
      images.map(async (image) => {
        const cont = docker.getImage(image.Id);
        try {
          const data = await cont.inspect();
          //console.log("Container data:", data);
          return data;
        } catch (err) {
          console.error("Error inspecting container:", err);
          throw err; 
        }
      })
    );

    return imageList;
  } catch (err) {
    console.error("Error listing images:", err);
    throw err;
  }
}

export async function deleteImage(id: string): Promise<boolean> {
  try {
    const image = docker.getImage(id);
    await image.remove();
    console.log(`Image ${id} deleted successfully`);
    return true;
  } catch (err) {
    console.error(`Error deleting image ${id}:`, err);
    throw err;
  }
}


export async function listNetworks(): Promise<NetworkInspectInfo[]> {
  try {
    const networks = await docker.listNetworks();
    //console.log("Netwokrs:", networks);
    const networksList = await Promise.all(
      networks.map(async (network) => {
        const netw = docker.getNetwork(network.Id);
        try {
          const data = await netw.inspect(); 
          //console.log("Container data:", data);
          return data; 
        } catch (err) {
          console.error("Error inspecting container:", err);
          throw err;
        }
      })
    );

    return networksList;
  } catch (err) {
    console.error("Error listing images:", err);
    throw err;
  }
}

export async function listVolumes(): Promise<VolumeInspectInfo[]> {
  try {
    const { Volumes, Warnings } = await docker.listVolumes(); 
    if (Warnings) {
      console.warn("Warnings:", Warnings);
    }

    const volumeList = await Promise.all(
      Volumes.map(async (volume) => {
        const vol = docker.getVolume(volume.Name);
        try {
          const data = await vol.inspect();
          return data; 
        } catch (err) {
          console.error("Error inspecting volume:", err);
          throw err;
        }
      })
    );

    return volumeList;
  } catch (err) {
    console.error("Error listing volumes:", err);
    throw err;
  }
}

export async function createVolume(options: VolumeCreateOptions): Promise<VolumeInspectInfo> {
  try {
    const volume = await docker.createVolume(options);
    console.log(`Volume ${volume.Name} created successfully`);

    // Inspect the volume
    var vol = docker.getVolume(volume.Name);
    const data = await vol.inspect();
    console.log(`Volume ${vol.name} created and inspected successfully`);
    //console.log("Container data:", data);

    return data;
  } catch (err) {
    console.error(`Error creating volume ${options.Name}:`, err);
    throw err;
  }
}
 export async function deleteVolume(name: string): Promise<boolean> {
  try {
    const volume = docker.getVolume(name);
    await volume.remove();
    console.log(`Volume ${name} deleted successfully`);
    return true;
  } catch (err) {
    console.error(`Error deleting volume ${name}:`, err);
    throw err;
  }
}

