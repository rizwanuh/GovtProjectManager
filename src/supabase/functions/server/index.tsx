import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Configure CORS and logging
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use("*", logger(console.log));

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY",
);

console.log("Environment check:", {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceRoleKey,
  urlPrefix: supabaseUrl?.substring(0, 20),
});

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
);

// Helper function to authenticate user
async function authenticateUser(request: Request) {
  if (!request) {
    console.log("Request object is undefined");
    return null;
  }

  if (!request.headers) {
    console.log("Request headers is undefined");
    return null;
  }

  const accessToken = request.headers
    .get("Authorization")
    ?.split(" ")[1];
  console.log(
    `Auth attempt with token: ${accessToken?.substring(0, 20)}...`,
  );

  if (
    !accessToken ||
    accessToken === Deno.env.get("SUPABASE_ANON_KEY")
  ) {
    console.log("No access token or using anon key");
    return null;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);
    console.log(
      `Auth result - User: ${user?.id}, Error: ${error?.message}`,
    );

    if (error || !user) {
      console.log(`Authentication failed: ${error?.message}`);
      return null;
    }

    return user;
  } catch (err) {
    console.log(`Authentication error: ${err}`);
    return null;
  }
}

// Routes
app.get("/make-server-d22d6276/", (c) => {
  return c.json({
    message: "Project Management API Server",
    status: "running",
  });
});

// Test route for debugging authentication
app.get("/make-server-d22d6276/test-auth", async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json(
        {
          message: "Not authenticated",
          headers: Object.fromEntries(c.req.headers.entries()),
        },
        401,
      );
    }

    return c.json({
      message: "Authentication successful",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Authentication routes
app.post("/make-server-d22d6276/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } =
      await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        // Automatically confirm the user's email since an email server hasn't been configured.
        email_confirm: true,
      });

    if (error) {
      console.log(`Sign up error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Sign up error: ${error}`);
    return c.json(
      { error: "Internal server error during signup" },
      500,
    );
  }
});

// Projects routes
app.get("/make-server-d22d6276/projects", async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      console.log("Unauthorized access attempt to projects");
      return c.json(
        { error: "Unauthorized - Please sign in" },
        401,
      );
    }

    console.log(`Getting projects for user: ${user.id}`);
    const projects = await kv.getByPrefix(
      `projects:${user.id}:`,
    );
    console.log(
      `Retrieved ${projects.length} projects for user ${user.id}`,
    );

    let projectData = projects;

    // If no projects exist, create some sample data for the user
    if (projectData.length === 0) {
      console.log(
        "No projects found, creating sample projects",
      );
      const sampleProjects = [
        {
          id: crypto.randomUUID(),
          name: "Website Redesign",
          description:
            "Complete overhaul of company website with modern design",
          status: "In Progress",
          priority: "High",
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          budget: 25000,
          tags: ["web", "design"],
          user_id: user.id,
          progress: 45,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: "Mobile App Development",
          description:
            "Create a mobile application for iOS and Android",
          status: "Planning",
          priority: "Medium",
          start_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          end_date: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          budget: 50000,
          tags: ["mobile", "app"],
          user_id: user.id,
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Save sample projects
      for (const project of sampleProjects) {
        await kv.set(
          `projects:${user.id}:${project.id}`,
          project,
        );
      }

      projectData = sampleProjects;
      console.log(
        `Created ${sampleProjects.length} sample projects`,
      );
    }

    return c.json(projectData);
  } catch (error) {
    console.log(`Error retrieving projects: ${error}`);
    return c.json(
      {
        error: `Failed to retrieve projects: ${error.message}`,
      },
      500,
    );
  }
});

app.post("/make-server-d22d6276/projects", async (c) => {
  try {
    console.log("Project creation request received");
    console.log(
      "Request headers:",
      Object.fromEntries(c.req.headers.entries()),
    );

    const user = await authenticateUser(c.req);
    if (!user) {
      console.log("Unauthorized project creation attempt");
      return c.json(
        { error: "Unauthorized - Please sign in" },
        401,
      );
    }

    const projectData = await c.req.json();
    console.log(
      `Creating project for user ${user.id}:`,
      projectData,
    );

    const projectId = crypto.randomUUID();

    const project = {
      id: projectId,
      ...projectData,
      user_id: user.id,
      progress: 0, // Default progress
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("About to save project to KV store");
    await kv.set(`projects:${user.id}:${projectId}`, project);
    console.log(
      `Created project ${projectId} for user ${user.id}`,
    );

    return c.json(project);
  } catch (error) {
    console.log(`Error creating project: ${error}`);
    return c.json(
      { error: `Failed to create project: ${error.message}` },
      500,
    );
  }
});

app.put("/make-server-d22d6276/projects/:id", async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectId = c.req.param("id");
    const updates = await c.req.json();

    const existingProject = await kv.get(
      `projects:${user.id}:${projectId}`,
    );
    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }

    const updatedProject = {
      ...existingProject,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await kv.set(
      `projects:${user.id}:${projectId}`,
      updatedProject,
    );
    console.log(
      `Updated project ${projectId} for user ${user.id}`,
    );

    return c.json(updatedProject);
  } catch (error) {
    console.log(`Error updating project: ${error}`);
    return c.json({ error: "Failed to update project" }, 500);
  }
});

app.delete("/make-server-d22d6276/projects/:id", async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectId = c.req.param("id");

    const existingProject = await kv.get(
      `projects:${user.id}:${projectId}`,
    );
    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }

    await kv.del(`projects:${user.id}:${projectId}`);

    // Also delete associated tasks
    const tasks = await kv.getByPrefix(
      `tasks:${user.id}:${projectId}:`,
    );
    const taskKeys = tasks.map(
      (task) => `tasks:${user.id}:${projectId}:${task.id}`,
    );
    if (taskKeys.length > 0) {
      await kv.mdel(taskKeys);
    }

    console.log(
      `Deleted project ${projectId} and associated tasks for user ${user.id}`,
    );

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting project: ${error}`);
    return c.json({ error: "Failed to delete project" }, 500);
  }
});

// Tasks routes
app.get("/make-server-d22d6276/tasks", async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const projectId = c.req.query("project_id");
    let tasks;

    if (projectId) {
      tasks = await kv.getByPrefix(
        `tasks:${user.id}:${projectId}:`,
      );
    } else {
      tasks = await kv.getByPrefix(`tasks:${user.id}:`);
    }

    console.log(
      `Retrieved ${tasks.length} tasks for user ${user.id}${projectId ? ` and project ${projectId}` : ""}`,
    );

    return c.json(tasks);
  } catch (error) {
    console.log(`Error retrieving tasks: ${error}`);
    return c.json({ error: "Failed to retrieve tasks" }, 500);
  }
});

app.post("/make-server-d22d6276/tasks", async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const taskData = await c.req.json();
    const taskId = crypto.randomUUID();

    // Verify project exists and belongs to user
    const project = await kv.get(
      `projects:${user.id}:${taskData.project_id}`,
    );
    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    const task = {
      id: taskId,
      ...taskData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(
      `tasks:${user.id}:${taskData.project_id}:${taskId}`,
      task,
    );
    console.log(
      `Created task ${taskId} for project ${taskData.project_id} and user ${user.id}`,
    );

    return c.json(task);
  } catch (error) {
    console.log(`Error creating task: ${error}`);
    return c.json({ error: "Failed to create task" }, 500);
  }
});

app.put("/make-server-d22d6276/tasks/:id", async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const taskId = c.req.param("id");
    const updates = await c.req.json();

    // Find the task by searching all project prefixes
    const allTasks = await kv.getByPrefix(`tasks:${user.id}:`);
    const existingTask = allTasks.find(
      (task) => task.id === taskId,
    );

    if (!existingTask) {
      return c.json({ error: "Task not found" }, 404);
    }
    const updatedTask = {
      ...existingTask,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await kv.set(
      `tasks:${user.id}:${existingTask.project_id}:${taskId}`,
      updatedTask,
    );
    console.log(`Updated task ${taskId} for user ${user.id}`);

    return c.json(updatedTask);
  } catch (error) {
    console.log(`Error updating task: ${error}`);
    return c.json({ error: "Failed to update task" }, 500);
  }
});

app.delete("/make-server-d22d6276/tasks/:id", async (c) => {
  try {
    const user = await authenticateUser(c.req);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const taskId = c.req.param("id");

    // Find the task by searching all project prefixes
    const allTasks = await kv.getByPrefix(`tasks:${user.id}:`);
    const existingTask = allTasks.find(
      (task) => task.id === taskId,
    );

    if (!existingTask) {
      return c.json({ error: "Task not found" }, 404);
    }
    await kv.del(
      `tasks:${user.id}:${existingTask.project_id}:${taskId}`,
    );
    console.log(`Deleted task ${taskId} for user ${user.id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting task: ${error}`);
    return c.json({ error: "Failed to delete task" }, 500);
  }
});

// Start the server
Deno.serve(app.fetch);